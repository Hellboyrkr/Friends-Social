// HobbyLink/backend/src/db.js

const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 

// 1. Connect to or create the database file
const dbPath = path.resolve(__dirname, '..', 'users.db');
const db = new Database(dbPath); // Note: Setting { verbose: console.log } can help debug SQL

// 2. Initialize the database table
const initializeDatabase = () => {
    // hobbies and friends are stored as TEXT containing JSON strings
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            age INTEGER NOT NULL,
            hobbies TEXT NOT NULL,
            friends TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            popularityScore REAL NOT NULL
        );
    `;
    db.exec(createTableSQL);
    console.log("✅ Database initialized and 'users' table ensured.");
};

// 3. Setup initial dummy data (Optional, but highly recommended for quick testing)
const createDummyUser = (data) => {
    const { username, age, hobbies, friends } = data;
    const user = {
        id: uuidv4(),
        username,
        age,
        hobbies: JSON.stringify(hobbies), 
        friends: JSON.stringify(friends), 
        createdAt: new Date().toISOString(),
        popularityScore: 0
    };

    const stmt = db.prepare(`
        INSERT INTO users (id, username, age, hobbies, friends, createdAt, popularityScore)
        VALUES (@id, @username, @age, @hobbies, @friends, @createdAt, @popularityScore)
    `);
    
    try {
        stmt.run(user);
    } catch (e) {
        // console.log(`User ${username} already exists.`);
    }
};

const setupDummyData = () => {
    createDummyUser({ username: 'Alice', age: 25, hobbies: ['Reading', 'Hiking'], friends: [] });
    createDummyUser({ username: 'Bob', age: 30, hobbies: ['Hiking', 'Coding'], friends: [] });
    createDummyUser({ username: 'Charlie', age: 22, hobbies: ['Gaming', 'Reading'], friends: [] });
};

// Run the setup functions
initializeDatabase();
setupDummyData();

module.exports = db;