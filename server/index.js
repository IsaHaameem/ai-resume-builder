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

// --- Configure CORS ---
// Define the allowed origins (your frontend URLs)
const allowedOrigins = [
    'http://localhost:5173', // Your local development frontend
    'https://ai-resume-builder-ten-vert.vercel.app' // Your live Vercel frontend URL
    // Add any other domains you might deploy to in the future
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    // or requests from domains in the allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      console.error(`CORS blocked for origin: ${origin}`); // Log blocked origins for debugging
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.')); // Block the request
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Explicitly list methods including OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly list headers
  credentials: false // Set to true if you were using cookies/sessions
};

// Apply CORS middleware *before* other middleware/routes
app.use(cors(corsOptions));

// --- The app.options('*', ...) line has been removed ---
// --- End CORS Configuration ---

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