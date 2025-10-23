import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse'; // v2 API
import mammoth from 'mammoth';
import OpenAI from 'openai';

// Import our new auth middleware and database model
import authMiddleware from '../middleware/auth.js';
import Evaluation from '../models/Evaluation.js';
import User from '../models/User.js';

const router = express.Router();

// Set up multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// This is our main AI prompt.
const getAIPrompt = (resumeText, jobDescription) => {
  return `
    You are an expert ATS (Applicant Tracking System) and a professional resume reviewer.
    Analyze the following resume text and compare it against the provided job description.

    **Resume Text:**
    """
    ${resumeText}
    """

    **Job Description:**
    """
    ${jobDescription}
    """

    Provide your evaluation in a strict JSON format. Do not include any text outside the JSON object.
    The JSON object must have the following structure:
    {
      "atsScore": <A percentage score (0-100) representing how well the resume matches the job description>,
      "grammarScore": <A percentage score (0-100) for grammar, spelling, and readability>,
      "summary": "<A 2-3 sentence professional summary of the candidate and their suitability for the role>",
      "strengths": ["<A bullet point for a key strength>", "<Another key strength>"],
      "weaknesses": ["<A bullet point for a key weakness or area for improvement>", "<Another key weakness>"],
      "skills": ["<List of relevant skills found in the resume>", "<Skill 2>", "..."]
    }
  `;
};

// Apply the authMiddleware to this route.
// This middleware will run *before* the upload handler.
router.post('/', authMiddleware, upload.single('resume'), async (req, res) => {
  
  // Initialize OpenAI client inside the route, where .env is loaded
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Get the job description from the form
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'No job description provided.' });
    }

    const fileBuffer = req.file.buffer;
    let extractedText = '';

    // --- File Parsing (With v2 API fix) ---
    if (req.file.mimetype === 'application/pdf') {
      // It's a PDF
      const parser = new PDFParse({ data: fileBuffer });
      const data = await parser.getText();
      extractedText = data.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // It's a DOCX
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX.' });
    }

    if (extractedText.length < 100) {
      return res.status(400).json({ error: 'Could not extract sufficient text from the file.' });
    }

    // --- OpenAI API Call ---
    console.log('Sending text to OpenAI for evaluation...');
    
    const prompt = getAIPrompt(extractedText, jobDescription);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" }, // Force JSON output
    });

    const aiResponse = completion.choices[0].message.content;
    const evaluation = JSON.parse(aiResponse); // Parse the JSON string from AI

    console.log('AI Evaluation successful:', evaluation);

    // --- NEW: SAVE TO MONGODB ---
    // The auth middleware added 'req.user' with the user's Firebase UID
    const newEvaluation = new Evaluation({
      userId: req.user._id, // This is the user's unique Firebase ID
      fileName: req.file.originalname,
      atsScore: evaluation.atsScore,
      grammarScore: evaluation.grammarScore,
      suggestions: [...evaluation.strengths, ...evaluation.weaknesses],
      keywords: evaluation.skills,
    });

    await newEvaluation.save();
    console.log('Evaluation saved to database.', newEvaluation._id);
    // ----------------------------

    // 2. Update the User document with the new evaluation's ID
    await User.findByIdAndUpdate(
      req.user._id, // The MongoDB ID of the authenticated user
      { $push: { uploadedResumes: newEvaluation._id } }, // PUSH the new ID into the array
      { new: true } // Return the updated document
    );
    console.log('Evaluation ID linked to user profile.');

    // Send the evaluation back to the frontend
    res.json({ evaluation: evaluation });

  } catch (error) {
    console.error('Error in /api/upload:', error);
    res.status(500).json({ error: 'Failed to evaluate resume.' });
  }
});

export default router;