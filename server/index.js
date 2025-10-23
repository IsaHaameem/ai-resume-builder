// Load environment variables *before* anything else.
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; // Import cors
import mongoose from 'mongoose';

// Import API route handlers
import uploadRoute from './routes/upload.js';
import generateRoute from './routes/generate.js';
import historyRoute from './routes/history.js';
import resumeRoute from './routes/resume.js';

const app = express();

// --- NEW Simplified CORS Setup ---
// Apply cors middleware *first* to handle all incoming requests, including OPTIONS
app.use(cors({
    origin: 'https://ai-resume-builder-ten-vert.vercel.app', // Allow ONLY your Vercel domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],    // Explicitly allow methods
    allowedHeaders: ['Content-Type', 'Authorization']    // Explicitly allow headers
}));
// ------------------------------


// Standard Middleware (AFTER CORS)
app.use(express.json()); // To parse JSON request bodies

// API Routes - Mount the route handlers (AFTER CORS and express.json)
app.use('/api/upload', uploadRoute);
app.use('/api/generate', generateRoute);
app.use('/api/history', historyRoute);
app.use('/api/resume', resumeRoute);

// Simple Base Route (for testing if the server is running)
app.get('/', (req, res) => {
  res.send('AI Resume Builder API is running!');
});

// Environment Variables for Server and Database
const PORT = process.env.PORT || 5001; // Use Render's PORT or default to 5001
const MONGO_URI = process.env.MONGO_URI;

// Input validation for critical environment variables
if (!MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined.');
    process.exit(1); // Exit if DB connection string is missing
}

// Connect to MongoDB Database and Start Server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start listening for requests only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    // Log detailed error if MongoDB connection fails
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the application if it cannot connect to the database
  });