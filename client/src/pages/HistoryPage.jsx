import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PDFViewer, Document, Page, Text } from '@react-pdf/renderer'; // Import PDFViewer and basic PDF components
import ResumePDFClassic from '../components/ResumePDFClassic'; // Import templates
import ResumePDFModern from '../components/ResumePDFModern';

// --- Modal Component ---
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="flex-grow p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- History Page Component ---
const HistoryPage = ({ user }) => {
  const [history, setHistory] = useState({ evaluations: [], generatedResumes: [] });
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingResumeData, setViewingResumeData] = useState(null); // { formData: {}, resumeJSON: {}, template: '' }
  const [isGenerating, setIsGenerating] = useState(false); // Loading state for re-generation

  useEffect(() => {
    const fetchHistory = async () => {
      console.log("HistoryPage useEffect triggered.");
      if (!user) {
        console.log("useEffect: No user object yet, returning.");
        // Set loading false if user is not available to avoid infinite loading
        setIsLoading(false);
        return;
      }
      console.log("useEffect: User object found.");

      try {
        // Set loading true only when starting the fetch
        setIsLoading(true);
        setError('');
        console.log("useEffect: Fetching history...");

        const token = await user.getIdToken();
        console.log("useEffect: Got token.");

        const response = await axios.get('http://localhost:5001/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("useEffect: Received response from API:", response.data);

        setHistory(response.data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history.');
        console.log("useEffect: Error caught.");
      } finally {
        // Always set loading false after attempt, regardless of success/fail
        setIsLoading(false);
        console.log("useEffect: Finished fetching, isLoading set to false.");
      }
    };

    fetchHistory();
  }, [user]); // Re-run effect if the user object changes

  // Helper to format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
  };

  // --- Function to Handle Viewing ---
  const handleViewResume = async (resumeId) => {
    if (!user) return;
    setIsGenerating(true);
    setError('');
    setViewingResumeData(null); // Clear previous data

    try {
      const token = await user.getIdToken();

      // 1. Fetch the saved formData and template
      console.log(`Fetching data for resume ID: ${resumeId}`);
      const dataRes = await axios.get(`https://ai-resume-api-f7go.onrender.com/api/resume/${resumeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { formData, templateUsed } = dataRes.data;
      console.log("Fetched formData and template:", formData, templateUsed);

      // Add safety check for formData
      if (!formData) {
          throw new Error("Fetched form data is missing or invalid.");
      }

      // 2. Re-run the AI generation using the fetched formData
      console.log("Re-generating resume content with AI...");
      // Ensure skills is handled correctly before sending to backend
      const skillsString = Array.isArray(formData.skills)
                            ? formData.skills.join(', ')
                            : (typeof formData.skills === 'string' ? formData.skills : '');

      const generationPayload = {
        ...(formData || {}), // Use fetched formData
        skills: skillsString, // Send skills back as a string, backend expects string
        template: templateUsed // Pass template name along
      };

      const genRes = await axios.post('https://ai-resume-api-f7go.onrender.com/api/generate', generationPayload, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const resumeJSON = genRes.data.resume;
      console.log("AI re-generation successful:", resumeJSON);

      // 3. Set state to open modal
      setViewingResumeData({ formData, resumeJSON, template: templateUsed });
      setIsModalOpen(true);

    } catch (err) {
      console.error("Error viewing resume:", err);
      let errorMsg = 'Failed to load or regenerate resume.';
       if (err.response) {
           console.error("Error response data:", err.response.data);
           errorMsg = `Failed to load/regenerate: ${err.response.data.error || 'Server error'}`;
       } else if (err.request) {
            console.error("Error request:", err.request);
            errorMsg = "Failed to load/regenerate: No response from server.";
       } else {
            console.error("Error message:", err.message);
             errorMsg = `Failed to load/regenerate: ${err.message}`;
       }
       setError(errorMsg); // Set the specific error message
    } finally {
      setIsGenerating(false);
      console.log("Finished handleViewResume.");
    }
  };

  // --- Function to Render the Correct PDF Template ---
  const renderPDF = () => {
    if (!viewingResumeData) {
        console.log("renderPDF called but viewingResumeData is null");
        return null;
    }
    const { formData, resumeJSON, template } = viewingResumeData;

    // Add safety check before rendering
    if (!formData || !resumeJSON) {
        console.error("Missing formData or resumeJSON for PDF rendering");
        // Provide a fallback document or error message within the viewer
        return (
            <Document>
                <Page><Text>Error: Could not load resume data for preview.</Text></Page>
            </Document>
        );
    }

    console.log("Rendering PDF with template:", template);
    if (template === 'modern') {
      return <ResumePDFModern resume={resumeJSON} formData={formData} />;
    }
    // Default to classic if template is missing or not 'modern'
    return <ResumePDFClassic resume={resumeJSON} formData={formData} />;
  };

  // --- Render Logic ---
  console.log("HistoryPage rendering. isLoading:", isLoading, "error:", error);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold">My History</h1>
            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                Back to Dashboard
            </Link>
        </div>

        {/* Loading/Error Display */}
        {isLoading && <p className="text-center text-gray-400">Loading history...</p>}
        {error && !isLoading && <p className="text-center text-red-500">{error}</p>}
        {isGenerating && <p className="text-center text-blue-400">Loading selected resume...</p>}


        {/* History Data Display */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Evaluations Column */}
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">My Evaluations</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2"> {/* Added padding-right for scrollbar */}
                    {history.evaluations.length === 0 ? ( <p className="text-gray-400">No evaluations found.</p>
                    ) : ( history.evaluations.map((item) => (
                        <div key={item._id} className="bg-gray-700 p-4 rounded-md">
                            <h3 className="font-semibold text-lg break-words">{item.fileName}</h3> {/* Ensure long names wrap */}
                            <p className="text-sm text-gray-400 mb-2">{formatDate(item.createdAt)}</p>
                            <div className="flex gap-4">
                                <span className="text-blue-400 font-medium">ATS Score: {item.atsScore}%</span>
                                <span className="text-green-400 font-medium">Grammar: {item.grammarScore}%</span>
                            </div>
                        </div>
                    )))}
                </div>
            </div>

            {/* Generated Resumes Column */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">My Generated Resumes</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2"> {/* Added padding-right for scrollbar */}
                {history.generatedResumes.length === 0 ? (
                  <p className="text-gray-400">No generated resumes found.</p>
                ) : (
                  history.generatedResumes.map((item) => (
                    // Updated Button Structure
                    <div
                      key={item._id}
                      className="flex justify-between items-center bg-gray-700 p-4 rounded-md hover:bg-gray-600 transition duration-200"
                    >
                      {/* Left side content */}
                      <div className="flex-grow mr-4">
                        <h3 className="font-semibold text-lg break-words text-white">
                            {item.roleTargeted || 'Generated Resume'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-1">
                            {formatDate(item.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                            Template: {item.templateUsed || 'Classic'}
                        </p>
                      </div>

                      {/* Right side "View" button */}
                      <button
                        onClick={() => handleViewResume(item._id)}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" // Prevents text wrapping
                      >
                        {/* Show "Loading..." text on the button itself while generating */}
                        {isGenerating && viewingResumeData?._id === item._id ? 'Loading...' : 'View'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for PDF Viewer */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {viewingResumeData ? (
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            {renderPDF()}
          </PDFViewer>
        ) : (
          // Display loading state inside the modal while PDF is generating
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-center p-10">Generating PDF Preview...</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryPage;