// HobbyLink/backend/src/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Renamed import for clarity: userController now represents the router instance
const userRouter = require('./usercontroller'); 

// Load environment variables from .env file
dotenv.config();

const app = express();
// Using 3001 as the standard backend port (assuming frontend uses 3000)
const PORT = process.env.PORT || 3001; 

// Middleware Setup
app.use(cors()); // Allow requests from any origin (needed for frontend development)
app.use(express.json()); // Allows the app to read JSON data sent in POST/PUT requests

// Root Test Endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Cybernauts Hobby Network API!');
});

// Connect Routes
// The entire router from userController is mounted here, handling all /api/* endpoints
app.use('/api', userRouter); 

// Global Error Handler (to catch unhandled exceptions)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('500 Internal Server Error: Something broke!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
