import mongoose from 'mongoose';

const GeneratedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  templateUsed: String,
  roleTargeted: String,
  formData: {
    type: Object, // Store the entire form input object
    required: true,
  },
  atsScore: Number, // Optional: We can score the generated resume
  aiFeedback: [String], // Feedback on the generated content
}, { timestamps: true });

const GeneratedResume = mongoose.model('GeneratedResume', GeneratedResumeSchema);

// This is the line that was missing or incorrect
export default GeneratedResume;