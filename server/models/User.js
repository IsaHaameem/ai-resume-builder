import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  uploadedResumes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation'
  }],
  generatedResumes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedResume'
  }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;