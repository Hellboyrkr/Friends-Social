// HobbyLink/backend/src/userController.js

const express = require('express');
const router = express.Router();
const userModel = require('./userModel');
const db = require('./db'); 

// --- Middleware Helpers ---

/**
 * Validates required fields for user creation/update.
 * Requires: username, age, and hobbies (must be an array).
 */
const validateUser = (req, res, next) => {
    const { username, age, hobbies } = req.body;
    if (!username || !age || !hobbies || !Array.isArray(hobbies)) {
        // 400 - Validation errors
        return res.status(400).json({ error: "400 Validation Error: username, age, and hobbies (as array) are required." });
    }
    next();
};

/**
 * Checks if a user exists by ID and attaches the user object to the request (req.user).
 */
const userExists = (req, res, next) => {
    const user = userModel.getUserById(req.params.id);
    if (!user) {
        // 404 - Not found
        return res.status(404).json({ error: "404 Not Found: User not found." });
    }
    req.user = user; 
    next();
};

// =========================================================================
// 1. CRUD Endpoints (Path: /api/users)
// =========================================================================

// GET /api/users 
// ROUTE FIX: Added '/users' to the path definition
router.get('/users', (req, res) => {
    try {
        const users = userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        // 500 - Internal Server Error
        res.status(500).json({ error: "500 Internal Server Error during fetch." });
    }
});

// POST /api/users (Create User)
// ROUTE FIX: Added '/users' to the path definition
router.post('/users', validateUser, (req, res) => {
    try {
        const user = userModel.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: "400 Validation Error: Username already exists." });
        }
        console.error("Error creating user:", error);
        res.status(500).json({ error: "500 Internal Server Error during creation." });
    }
});

// PUT /api/users/:id (Update User)
// ROUTE FIX: Added '/users' to the path definition
router.put('/users/:id', userExists, (req, res) => {
    try {
        const updatedUser = userModel.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "500 Internal Server Error during update." });
    }
});

// DELETE /api/users/:id (Delete User)
// ROUTE FIX: Added '/users' to the path definition
router.delete('/users/:id', userExists, (req, res) => {
    // --- Deletion Rule Check ---
    if (req.user.friends.length > 0) {
        // 409 - Relationship conflict
        return res.status(409).json({ error: "409 Relationship Conflict: Cannot delete user while connected to others. Unlink first." });
    }   console.log("Deleting user with ID:", req.params.id);

    try {
        userModel.deleteUser(req.params.id);
        res.status(204).send(); // 204 No Content on success
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "500 Internal Server Error during deletion." });
    }
});


// =========================================================================
// 2. Relationship Endpoints (Path: /api/users/:id/...)
// =========================================================================

// POST /api/users/:id/link -> Create relationship (Friendship)
// ROUTE FIX: Added '/users' to the path definition
router.post('/users/:id/link', userExists, (req, res) => {
    const userA = req.user; 
    const userBId = req.body.friendId; 

    if (!userBId) {
        return res.status(400).json({ error: "400 Validation Error: Missing friendId in request body." });
    }
    if (userA.id === userBId) {
        return res.status(400).json({ error: "400 Validation Error: Cannot link user to self." });
    }
    
    const userB = userModel.getUserById(userBId);
    if (!userB) {
        return res.status(404).json({ error: "404 Not Found: Friend user not found." });
    }

    // --- Circular Friendship Prevention Check (A -> B and B -> A treated as one) ---
    if (userA.friends.includes(userBId)) {
        return res.status(409).json({ error: "409 Relationship Conflict: Users are already linked." });
    }

    try {
        // Use a transaction for mutual update safety
        db.transaction(() => {
            // Update User A's friends list
            const friendsA = [...userA.friends, userBId];
            db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(JSON.stringify(friendsA), userA.id);

            // Update User B's friends list
            const friendsB = [...userB.friends, userA.id];
            db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(JSON.stringify(friendsB), userBId);
        })(); 

        res.status(200).json({ message: `Successfully linked ${userA.username} and ${userB.username}.` });

    } catch (error) {
        console.error("Error creating relationship:", error);
        res.status(500).json({ error: "500 Internal Server Error during link." });
    }
});

// DELETE /api/users/:id/unlink -> Remove relationship
// ROUTE FIX: Added '/users' to the path definition
router.delete('/users/:id/unlink', userExists, (req, res) => {
    const userA = req.user;
    const userBId = req.body.friendId;

    if (!userBId) {
        return res.status(400).json({ error: "400 Validation Error: Missing friendId in request body." });
    }

    if (!userA.friends.includes(userBId)) {
        return res.status(409).json({ error: "409 Relationship Conflict: Users are not currently linked." });
    }

    try {
        db.transaction(() => {
            // Remove B's ID from A's list
            const friendsA = userA.friends.filter(id => id !== userBId);
            db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(JSON.stringify(friendsA), userA.id);

            // Remove A's ID from B's list
            const userB = userModel.getUserById(userBId);
            const friendsB = userB.friends.filter(id => id !== userA.id);
            db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(JSON.stringify(friendsB), userBId);
        })();

        res.status(200).json({ message: `Successfully unlinked ${userA.username} and user ${userBId}.` });

    } catch (error) {
        console.error("Error removing relationship:", error);
        res.status(500).json({ error: "500 Internal Server Error during unlink." });
    }
});


// =========================================================================
// 3. Graph Data Endpoint (Path: /api/graph)
// =========================================================================

// GET /api/graph -> Return graph data (nodes + edges for React Flow)
router.get('/graph', async (req, res) => {
    try {
        const users = userModel.getAllUsers();
        const nodes = [];
        const edges = [];
        const edgeSet = new Set(); 

        users.forEach(user => {
            // 1. Create Node (User) - Add random position for initial React Flow display
            nodes.push({
                id: user.id,
                data: { 
                    username: user.username, 
                    age: user.age, 
                    hobbies: user.hobbies,
                    popularityScore: user.popularityScore
                },
                position: { x: Math.random() * 600, y: Math.random() * 400 } 
            });

            // 2. Create Edges (Relationships)
            user.friends.forEach(friendId => {
                // Ensure the edge is only created once (A->B or B->A)
                const source = user.id < friendId ? user.id : friendId;
                const target = user.id < friendId ? friendId : user.id;
                const edgeKey = `${source}-${target}`;

                if (!edgeSet.has(edgeKey)) {
                    edges.push({
                        id: `e-${edgeKey}`,
                        source: source,
                        target: target,
                        type: 'default' 
                    });
                    edgeSet.add(edgeKey);
                }
            });
        });

        res.json({ nodes, edges });

    } catch (error) {
        console.error("Error generating graph data:", error);
        res.status(500).json({ error: "500 Internal Server Error generating graph data." });
    }
});


module.exports = router;
