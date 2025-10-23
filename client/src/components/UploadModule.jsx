import React, { useState } from 'react';
import axios from 'axios';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

// --- NEW COMPONENT: Score Radial Chart (REFINED) ---
const ScoreChart = ({ atsScore, grammarScore }) => {
  const data = [
    {
      name: 'ATS Score',
      score: atsScore,
      fill: '#3B82F6', // Blue color
    },
    {
      name: 'Grammar',
      score: grammarScore,
      fill: '#10B981', // Green color
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}> {/* Increased height slightly */}
      <RadialBarChart
        cx="50%" // Center X
        cy="50%" // Center Y
        innerRadius="30%" // Increased inner radius
        outerRadius="90%" // Increased outer radius
        barSize={30} // Set a fixed bar size for consistency
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar 
          minAngle={15} // Slightly larger min angle for visibility
          label={{ 
            position: 'insideStart', // Label inside the bar at the start
            fill: '#fff', 
            fontSize: '14px',
            formatter: (score) => `${score}%` // Format label to show percentage
          }} 
          background 
          clockWise 
          dataKey="score"
        />
        {/* --- Legend position adjusted to bottom --- */}
        <Legend 
          iconSize={10} 
          layout="horizontal" // Horizontal layout
          verticalAlign="bottom" // Position at the bottom
          align="center"       // Align in the center horizontally
          wrapperStyle={{ 
            color: 'white', 
            fontSize: '14px', 
            paddingTop: '10px' // Add some padding from the chart
          }}
          formatter={(value, entry) => (
            <span style={{ color: 'white' }}>
              {value}: {entry.payload.score}%
            </span>
          )}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

// --- EvaluationResult Component (Modified) ---
const EvaluationResult = ({ result }) => {
  // Destructure scores for easy access
  const { atsScore, grammarScore } = result;

  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-lg font-semibold mb-2 text-white">Evaluation Results</h4>

      {/* --- Chart Visualization --- */}
      <div className="bg-gray-900 p-2 rounded-lg flex items-center justify-center">
        <ScoreChart atsScore={atsScore} grammarScore={grammarScore} />
      </div>
      {/* --------------------------- */}
      
      {/* Summary */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h5 className="font-semibold mb-2 text-white">Professional Summary</h5>
        <p className="text-sm text-gray-300">{result.summary}</p>
      </div>
      
      {/* Scores (Text format remains for redundancy/clarity) */}
      <div className="flex gap-4">
        <div className="flex-1 text-center bg-gray-900 p-4 rounded-lg border-t-2 border-blue-500">
          <div className="text-xl font-bold text-blue-400">{atsScore}%</div>
          <div className="text-xs text-gray-400">ATS Match Score</div>
        </div>
        <div className="flex-1 text-center bg-gray-900 p-4 rounded-lg border-t-2 border-green-500">
          <div className="text-xl font-bold text-green-400">{grammarScore}%</div>
          <div className="text-xs text-gray-400">Grammar & Readability</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h5 className="font-semibold mb-2 text-green-400">Strengths</h5>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {result.strengths.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h5 className="font-semibold mb-2 text-red-400">Weaknesses</h5>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {result.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h5 className="font-semibold mb-2 text-white">Detected Skills</h5>
        <div className="flex flex-wrap gap-2">
          {result.skills.map((skill, i) => (
            <span key={i} className="bg-gray-700 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


// Main Upload Component
const UploadModule = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('Upload a PDF/DOCX and paste a job description.');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); // This will hold our JSON object

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setSelectedFile(file);
        setStatusMessage(`File selected: ${file.name}`);
        setEvaluationResult(null); // Clear previous results
      } else {
        setStatusMessage('Error: Please upload a PDF or DOCX file.');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    // Check for user first
    if (!user) {
      setStatusMessage('Error: You must be logged in.');
      return;
    }
    if (!selectedFile) {
      setStatusMessage('Error: No file selected.');
      return;
    }
    if (!jobDescription) {
      setStatusMessage('Error: Please paste a job description.');
      return;
    }

    setIsLoading(true);
    setEvaluationResult(null);
    setStatusMessage('Uploading and processing...');

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('jobDescription', jobDescription); // Add job description

      // Send the file to our backend
      const response = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Send the token
        },
      });
      
      // Success
      setIsLoading(false);
      setStatusMessage('Evaluation complete! (And saved to your account)');
      setEvaluationResult(response.data.evaluation); // Save the JSON object

    } catch (error) {
      // Error
      setIsLoading(false);
      console.error('Upload error:', error);
      if (error.response) {
        setStatusMessage(`Error: ${error.response.data.error}`);
      } else {
        setStatusMessage('Error: Failed to upload file.');
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Upload & Evaluate</h3>
      
      {/* File Input */}
      <input 
        type="file" 
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-300
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white
                   hover:file:bg-blue-700
                   cursor-pointer mb-4"
      />
      
      {/* Job Description Textarea */}
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the target job description here..."
        rows="5"
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   text-white text-sm mb-4"
      />

      {/* Upload Button */}
      <button 
        onClick={handleUpload}
        disabled={isLoading || !selectedFile || !jobDescription}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                   transition duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Evaluating with AI...' : 'Upload & Evaluate'}
      </button>

      {/* Status Message */}
      <p className="text-gray-400 text-sm mt-4 text-center">{statusMessage}</p>

      {/* Render the results */}
      {evaluationResult && (
        <EvaluationResult result={evaluationResult} />
      )}
    </div>
  );
};

export default UploadModule;