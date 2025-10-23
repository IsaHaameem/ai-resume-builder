import express from 'express';
import authMiddleware from '../middleware/auth.js';
import GeneratedResume from '../models/GeneratedResume.js';
import mongoose from 'mongoose'; // Import mongoose

const router = express.Router();

// GET a specific generated resume's data by its ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user._id;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ error: 'Invalid resume ID format.' });
    }

    const resumeData = await GeneratedResume.findOne({
        _id: resumeId,
        userId: userId // Ensure the user owns this resume
    });

    if (!resumeData) {
      return res.status(404).json({ error: 'Generated resume not found or access denied.' });
    }

    // --- FIX: Check if formData exists ---
    if (!resumeData.formData || typeof resumeData.formData !== 'object' || Object.keys(resumeData.formData).length === 0) {
        console.warn(`Resume data found for ID ${resumeId}, but formData is missing or empty.`);
        return res.status(404).json({ error: 'Historical resume data (formData) not found for this entry. Cannot re-generate.' });
    }
    // ------------------------------------

    // Return the essential data needed to re-render/re-generate
    res.json({
        formData: resumeData.formData,
        templateUsed: resumeData.templateUsed
    });

  } catch (error) {
    console.error('Error fetching specific resume data:', error);
    res.status(500).json({ error: 'Failed to fetch resume data.' });
  }
});

export default router;