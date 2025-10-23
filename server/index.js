// --- THIS IS THE FIX ---
// Load environment variables *before* anything else.
import dotenv from 'dotenv';
dotenv.config();
// -----------------------

import express from 'express';

import cors from 'cors';
import mongoose from 'mongoose';

// Now we can safely import other files that use the .env variables
import uploadRoute from './routes/upload.js'; 
import generateRoute from './routes/generate.js';
import historyRoute from './routes/history.js';
import resumeRoute from './routes/resume.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// API Routes
app.use('/api/upload', uploadRoute);
app.use('/api/generate', generateRoute);
app.use('/api/history', historyRoute);
app.use('/api/resume', resumeRoute);

// A simple test route
app.get('/', (req, res) => {
  res.send('AI Resume Builder API is running!');
});

const PORT = process.env.PORT || 5001; 
const MONGO_URI = process.env.MONGO_URI; // This will now be loaded

// Connect to MongoDB and start the server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });