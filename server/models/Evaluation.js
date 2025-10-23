import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  atsScore: Number,
  grammarScore: Number,
  suggestions: [String],
  keywords: [String],
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', EvaluationSchema);
export default Evaluation;