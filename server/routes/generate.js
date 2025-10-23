import express from 'express';
import OpenAI from 'openai';

// Import auth middleware and database model
import authMiddleware from '../middleware/auth.js';
import GeneratedResume from '../models/GeneratedResume.js';

const router = express.Router();

// This is the prompt for the AI Resume Builder.
const getResumePrompt = (formData) => {
  // --- FIX: Provide default empty arrays for safety ---
  const {
    name = '', email = '', phone = '', linkedin = '', github = '', portfolio = '',
    education = [], // Default to empty array
    experience = [], // Default to empty array
    // Skills are handled differently as they become an array later, but default input
    skills: skillsInput = '',
    projects = [], // Default to empty array
    certifications = [], // Default to empty array
    role = ''
  } = formData || {}; // Also default formData itself if it's null/undefined
  // --------------------------------------------------

  // Build sections (Now safe even if arrays were missing)
  const educationSection = education.map(edu =>
    `- ${edu.degree || 'Degree'} in ${edu.field || 'Field'}, ${edu.school || 'School'} (${edu.year || 'Year'}). CGPA: ${edu.cgpa || 'N/A'}`
  ).join('\n');

  const experienceSection = experience.map(exp =>
    `**${exp.title || 'Job Title'} at ${exp.company || 'Company'} (${exp.duration || 'Duration'})**\n- ${exp.duties ? exp.duties.split('\n').join('\n- ') : 'Duties not specified'}`
  ).join('\n\n');

  // Skills are processed from the input string if available
  const skillsArray = typeof skillsInput === 'string' ? skillsInput.split(',').map(s => s.trim()) : [];
  const skillsSection = skillsArray.join(', ');


  const projectsSection = projects.map(proj =>
    `**${proj.name || 'Project Name'}** [Tech: ${proj.tech || 'Tech Stack'}](${proj.link || ''})\n- ${proj.description || 'Description not provided'}`
  ).join('\n\n');

  const certificationsSection = certifications.map(cert =>
    `- ${cert.name || 'Cert Name'} from ${cert.issuer || 'Issuer'} (${cert.year || 'Year'})`
  ).join('\n');

  // --- The rest of the prompt structure remains the same ---
  return `
    You are an expert resume writer for a top-tier tech company.
    A candidate has provided the following information and wants to generate a professional, one-page resume.
    The target role is: **${role}**.

    **Candidate Information:**
    - Name: ${name}
    - Email: ${email}
    - Phone: ${phone}
    - LinkedIn: ${linkedin || 'N/A'}
    - GitHub: ${github || 'N/A'}
    - Portfolio: ${portfolio || 'N/A'}
    - Education:\n${educationSection}
    - Experience:\n${experienceSection}
    - Skills: ${skillsSection}
    - Projects:\n${projectsSection}
    - Certifications:\n${certificationsSection}

    **Your Task:**
    Generate a full resume based on this information. The resume must be professional, concise, and heavily optimized for ATS (Applicant Tracking Systems) targeting the role of "${role}".

    Use strong action verbs and quantify achievements.
    Include contact links (LinkedIn, GitHub, Portfolio) if provided.
    Include project links if provided.
    Include certifications if provided.
    **Crucially, include ALL education entries provided in the 'Education' section.**

    Return the output in a strict JSON format. Do not include any text outside the JSON object.
    The JSON object must have the following structure:
    {
      "summary": "<A 3-4 sentence professional summary, tailored to the target role>",
      "education": [
        // Expect an array of strings, one for each education entry
        "<Full line for first education entry, e.g., B.Tech in Computer Science, SRM University, 2027. CGPA: 8.5>",
        "<Full line for second education entry, e.g., High School Diploma, Example School, 2023. Percentage: 90%>"
        // ... potentially more entries
      ],
      "skills": {
        "technical": ["<List of technical skills>", "<Skill 2>"],
        "soft": ["<List of soft skills>"]
      },
      "experience": [
        {
          "title": "<Job Title>",
          "company": "<Company Name>",
          "duration": "<Duration>",
          "bulletPoints": [ "<Action-verb-led bullet point>", "<Another bullet point>" ]
        }
      ],
      "projects": [
        {
          "name": "<Project Name>",
          "description": "<A 1-2 sentence description, rewritten professionally>",
          "link": "<Project URL, if provided>"
        }
      ],
      "certifications": [
         // Change certifications to array of strings too
         "<Full line for first certification>",
         "<Full line for second certification>"
      ]
    }
  `;
};

// Apply middleware to protect the route
router.post('/', authMiddleware, async (req, res) => {
  // Initialize OpenAI client inside the route
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Separate template from the rest of the form data
    const { template, ...formData } = req.body;

    // --- OpenAI API Call ---
    console.log('Sending resume data to OpenAI for generation...');

    // Pass only the actual form data to the prompt function
    const prompt = getResumePrompt(formData);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" }, // Force JSON output
    });

    const aiResponse = completion.choices[0].message.content;
    const generatedResume = JSON.parse(aiResponse); // Parse the JSON string from AI

    console.log('AI Resume generation successful.');

    // --- SAVE TO MONGODB ---
    // The auth middleware added req.user
    const newResume = new GeneratedResume({
      userId: req.user._id, // This is our MongoDB user's ObjectId
      fileName: `${formData.name.split(' ').join('_')}_Resume.pdf`,
      templateUsed: template, // Save the template name passed from the frontend
      roleTargeted: formData.role,
      formData: formData // Save the original form data (without the template field)
    });

    await newResume.save();
    console.log('Generated resume metadata and form data saved to database.');

    // Send the generated resume back to the frontend
    res.json({ resume: generatedResume });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    // Send a more specific error message if possible
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate resume.';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;