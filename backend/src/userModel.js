// HobbyLink/backend/src/userModel.js

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// --- Helper Functions for Data Formatting ---

/**
 * Parses user data from DB (JSON strings to JS arrays) and ensures score is a number.
 */
const formatUser = (userData) => {
    if (!userData) return null;
    return {
        ...userData,
        hobbies: JSON.parse(userData.hobbies || '[]'),
        friends: JSON.parse(userData.friends || '[]'),
        popularityScore: parseFloat(userData.popularityScore)
    };
};

/**
 * Calculates the Popularity Score.
 * Formula: friends + (shared hobbies * 0.5)
 */
const calculatePopularityScore = (user, userMap) => {
    const friendCount = user.friends.length;
    let sharedHobbiesCount = 0;

    user.friends.forEach(friendId => {
        const friend = userMap.get(friendId);
        if (friend) {
            // Find shared hobbies
            const userHobbies = new Set(user.hobbies);
            friend.hobbies.forEach(hobby => {
                if (userHobbies.has(hobby)) {
                    sharedHobbiesCount++;
                }
            });
        }
    });

    return friendCount + (sharedHobbiesCount * 0.5);
};


// --- Core DB Operations ---

/**
 * Fetches all users and updates their popularity scores.
 */
const getAllUsers = () => {
    const allRawUsers = db.prepare('SELECT * FROM users').all();
    const allUsers = allRawUsers.map(formatUser);
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    const usersWithUpdatedScores = allUsers.map(user => {
        const newScore = calculatePopularityScore(user, userMap);
        
        // Update score in DB if it changed
        if (newScore !== user.popularityScore) {
             db.prepare(`
                UPDATE users SET popularityScore = ? WHERE id = ?
            `).run(newScore, user.id);
            user.popularityScore = newScore; 
        }
        return user;
    });

    return usersWithUpdatedScores;
};

/**
 * Fetches a single user by ID.
 */
const getUserById = (id) => {
    return formatUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
};

/**
 * Creates a new user in the database.
 */
const createUser = (userData) => {
    const newUser = {
        id: uuidv4(),
        username: userData.username,
        age: userData.age,
        hobbies: JSON.stringify(userData.hobbies || []),
        friends: '[]',
        createdAt: new Date().toISOString(),
        popularityScore: 0
    };

    const stmt = db.prepare(`
        INSERT INTO users (id, username, age, hobbies, friends, createdAt, popularityScore)
        VALUES (@id, @username, @age, @hobbies, @friends, @createdAt, @popularityScore)
    `);
    
    stmt.run(newUser);
    
    return getUserById(newUser.id);
};

/**
 * Updates an existing user's details.
 */
const updateUser = (id, updates) => {
    const user = getUserById(id);
    if (!user) return null;

    const updatedData = {
        username: updates.username || user.username,
        age: updates.age || user.age,
        hobbies: JSON.stringify(updates.hobbies || user.hobbies),
    };
    
    db.prepare(`
        UPDATE users SET username = ?, age = ?, hobbies = ? WHERE id = ?
    `).run(updatedData.username, updatedData.age, updatedData.hobbies, id);

    // Return the updated user (score will be correct on the next getAllUsers call)
    return getUserById(id);
};

/**
 * Deletes a user by ID.
 */
const deleteUser = (id) => {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    formatUser, 
    calculatePopularityScore 
};