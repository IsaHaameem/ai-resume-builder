import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Evaluation from '../models/Evaluation.js';
import GeneratedResume from '../models/GeneratedResume.js';

const router = express.Router();

// This route is protected by our auth middleware
router.get('/', authMiddleware, async (req, res) => {
  try {
    // req.user._id is the user's MongoDB ObjectId, added by the middleware
    const userId = req.user._id;

    // Fetch all records for this user, sorted newest first
    const evaluations = await Evaluation.find({ userId: userId })
      .sort({ createdAt: -1 });
      
    const generatedResumes = await GeneratedResume.find({ userId: userId })
      .sort({ createdAt: -1 });

    // Send both lists back to the frontend
    res.json({ evaluations, generatedResumes });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch user history.' });
  }
});

export default router;