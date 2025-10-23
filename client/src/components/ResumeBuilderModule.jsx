import React, { useState } from 'react';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDFClassic from './ResumePDFClassic.jsx'; // Make sure paths are correct
import ResumePDFModern from './ResumePDFModern.jsx'; // Make sure paths are correct

// --- Form Component ---
const ResumeBuilderForm = ({ user, formData, setFormData, template, setTemplate, setIsLoading, setGeneratedResume }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (index, e, listName) => {
    const { name, value } = e.target;
    const list = [...formData[listName]];
    list[index][name] = value;
    setFormData(prev => ({ ...prev, [listName]: list }));
  };

  const addListItem = (listName) => {
    if (listName === 'education') {
      setFormData(prev => ({ ...prev, education: [...prev.education, { school: '', degree: '', field: '', year: '', cgpa: '' }] }));
    } else if (listName === 'experience') {
      setFormData(prev => ({ ...prev, experience: [...prev.experience, { company: '', title: '', duration: '', duties: '' }] }));
    } else if (listName === 'projects') {
      setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', description: '', tech: '', link: '' }] })); // Added link
    } else if (listName === 'certifications') {
      setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuer: '', year: '' }] })); // NEW Certifications
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { console.error("User is not logged in!"); return; }
    setIsLoading(true);
    setGeneratedResume(null);

    // Construct payload. Note: skills remains a string here, as the backend needs to split it
    const payload = {
      ...formData,
      template: template // Include the selected template name
    };

    try {
      const token = await user.getIdToken();
      const response = await axios.post('http://localhost:5001/api/generate', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGeneratedResume(response.data.resume);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating resume:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* --- Personal Details (Added Links) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="input-style" />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="input-style" />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="input-style" />
        <input name="role" value={formData.role} onChange={handleChange} placeholder="Target Job Role" required className="input-style" />
        <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL (Optional)" className="input-style" />
        <input name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL (Optional)" className="input-style" />
        <input name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="Portfolio URL (Optional)" className="input-style md:col-span-2" />
      </div>

      {/* --- Skills --- */}
      <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="Enter your skills, separated by commas..." required rows="5" className="input-style" />

      {/* --- Education --- */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Education</h4>
        {formData.education.map((edu, index) => (
          <div key={index} className="space-y-2 mb-2 p-3 bg-gray-700/50 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input name="school" value={edu.school} onChange={(e) => handleListChange(index, e, 'education')} placeholder="School/University" className="input-style" />
              <input name="degree" value={edu.degree} onChange={(e) => handleListChange(index, e, 'education')} placeholder="Degree" className="input-style" />
              <input name="field" value={edu.field} onChange={(e) => handleListChange(index, e, 'education')} placeholder="Field of Study" className="input-style" />
              <div className="grid grid-cols-2 gap-2">
                <input name="year" value={edu.year} onChange={(e) => handleListChange(index, e, 'education')} placeholder="Graduation Year" className="input-style" />
                <input name="cgpa" value={edu.cgpa} onChange={(e) => handleListChange(index, e, 'education')} placeholder="CGPA" className="input-style" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addListItem('education')} className="text-sm text-blue-400">+ Add Education</button>
      </div>

      {/* --- Experience --- */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Experience</h4>
        {formData.experience.map((exp, index) => (
          <div key={index} className="space-y-2 mb-4 p-3 bg-gray-700/50 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input name="title" value={exp.title} onChange={(e) => handleListChange(index, e, 'experience')} placeholder="Job Title" className="input-style" />
              <input name="company" value={exp.company} onChange={(e) => handleListChange(index, e, 'experience')} placeholder="Company" className="input-style" />
              <input name="duration" value={exp.duration} onChange={(e) => handleListChange(index, e, 'experience')} placeholder="Duration" className="input-style" />
            </div>
            <textarea name="duties" value={exp.duties} onChange={(e) => handleListChange(index, e, 'experience')} placeholder="Duties/Achievements (one per line)" rows="5" className="input-style" />
          </div>
        ))}
        <button type="button" onClick={() => addListItem('experience')} className="text-sm text-blue-400">+ Add Experience</button>
      </div>

      {/* --- Projects (Added Link) --- */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Projects</h4>
        {formData.projects.map((proj, index) => (
          <div key={index} className="space-y-2 mb-4 p-3 bg-gray-700/50 rounded-md">
            <input name="name" value={proj.name} onChange={(e) => handleListChange(index, e, 'projects')} placeholder="Project Name" className="input-style" />
            <input name="tech" value={proj.tech} onChange={(e) => handleListChange(index, e, 'projects')} placeholder="Tech Stack" className="input-style" />
            <input name="link" value={proj.link} onChange={(e) => handleListChange(index, e, 'projects')} placeholder="Live Demo/Repo URL (Optional)" className="input-style" />
            <textarea name="description" value={proj.description} onChange={(e) => handleListChange(index, e, 'projects')} placeholder="Short project description" rows="3" className="input-style" />
          </div>
        ))}
        <button type="button" onClick={() => addListItem('projects')} className="text-sm text-blue-400">+ Add Project</button>
      </div>

      {/* --- Certifications --- */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Certifications</h4>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 p-3 bg-gray-700/50 rounded-md">
            <input name="name" value={cert.name} onChange={(e) => handleListChange(index, e, 'certifications')} placeholder="Certification Name" className="input-style" />
            <input name="issuer" value={cert.issuer} onChange={(e) => handleListChange(index, e, 'certifications')} placeholder="Issuing Organization" className="input-style" />
            <input name="year" value={cert.year} onChange={(e) => handleListChange(index, e, 'certifications')} placeholder="Year Obtained" className="input-style" />
          </div>
        ))}
        <button type="button" onClick={() => addListItem('certifications')} className="text-sm text-blue-400">+ Add Certification</button>
      </div>

      {/* --- Template Selector (Visual Update) --- */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Choose a Template</h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${template === 'classic' ? 'border-blue-500 ring-2 ring-blue-500 bg-gray-700/50' : 'border-gray-600 bg-gray-700/20'}`}>
            <input type="radio" name="template" value="classic" checked={template === 'classic'} onChange={(e) => setTemplate(e.target.value)} className="hidden"/>
            
            {/* Template Image/Preview (Placeholder) */}
            <img src="./public/classic_template.png" alt="Classic Template Preview" className="w-full h-auto rounded mb-3 border border-gray-600" />
            
            <span className="font-bold text-lg">Classic</span>
            <p className="text-sm text-gray-400">Traditional single-column, ATS-friendly format.</p>
          </label>
          
          <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${template === 'modern' ? 'border-blue-500 ring-2 ring-blue-500 bg-gray-700/50' : 'border-gray-600 bg-gray-700/20'}`}>
            <input type="radio" name="template" value="modern" checked={template === 'modern'} onChange={(e) => setTemplate(e.target.value)} className="hidden"/>
            
            {/* Template Image/Preview (Placeholder) */}
            <img src="/public/modern_template.png" alt="Modern Template Preview" className="w-full h-auto rounded mb-3 border border-gray-600" />
            
            <span className="font-bold text-lg">Modern</span>
            <p className="text-sm text-gray-400">Visually striking two-column design with a sidebar.</p>
          </label>
        </div>
      </div>

      {/* --- Submit Button --- */}
      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-300">
        Generate My Resume
      </button>
    </form>
  );
};

// --- Results Component ---
const GeneratedResume = ({ resume, formData, template, setGeneratedResume }) => {
  const renderTemplate = () => {
    const props = { resume, formData };
    if (template === 'modern') return <ResumePDFModern {...props} />;
    return <ResumePDFClassic {...props} />;
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Your AI-Generated Resume</h3>
        <button onClick={() => setGeneratedResume(null)} className="text-sm text-gray-400 hover:text-white">Start Over</button>
      </div>
      {/* --- Display Sections --- */}
      <div className="mb-4"><h4 className="text-xl font-semibold text-green-400 mb-2">Professional Summary</h4><p className="text-gray-300">{resume.summary}</p></div>
      <div className="mb-4"><h4 className="text-xl font-semibold text-green-400 mb-2">Experience</h4>{resume.experience.map((exp, i) => (<div key={i} className="mb-3"><h5 className="font-semibold text-white">{exp.title}</h5><div className="flex justify-between text-sm text-gray-400"><span>{exp.company}</span><span>{exp.duration}</span></div><ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">{exp.bulletPoints.map((point, j) => <li key={j}>{point}</li>)}</ul></div>))}</div>
      <div className="mb-4"><h4 className="text-xl font-semibold text-green-400 mb-2">Skills</h4><p className="text-gray-300"><span className="font-semibold">Technical: </span>{resume.skills.technical.join(', ')}</p><p className="text-gray-300"><span className="font-semibold">Soft: </span>{resume.skills.soft.join(', ')}</p></div>
      <div className="mb-4"><h4 className="text-xl font-semibold text-green-400 mb-2">Education</h4>{resume.education.map((edu, i) => (<p key={i} className="text-gray-300">{edu}</p>))}</div>
      <div className="mb-4"><h4 className="text-xl font-semibold text-green-400 mb-2">Projects</h4>{resume.projects.map((proj, i) => (<div key={i} className="mb-2"><h5 className="font-semibold text-white">{proj.name}{proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm ml-2 hover:underline">[Link]</a>}</h5><p className="text-gray-300">{proj.description}</p></div>))}</div>
      {/* Display Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
          <div className="mb-4"><h4 className="text-xl font-semibold text-green-400 mb-2">Certifications</h4>{resume.certifications.map((cert, i) => (<p key={i} className="text-gray-300">{cert}</p>))}</div>
      )}
      {/* --- Download Button --- */}
      <PDFDownloadLink document={renderTemplate()} fileName={`${formData.name.split(' ').join('_')}_Resume.pdf`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-300 mt-6">
        {({ loading }) => loading ? 'Generating PDF...' : 'Download as PDF'}
      </PDFDownloadLink>
    </div>
  );
};

// --- Main Module Component ---
const ResumeBuilderModule = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [template, setTemplate] = useState('classic');

  // UPDATED: Added links and certifications to initial state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: '',
    linkedin: '', github: '', portfolio: '', // NEW Links
    skills: '',
    education: [{ school: '', degree: '', field: '', year: '', cgpa: '' }],
    experience: [{ company: '', title: '', duration: '', duties: '' }],
    projects: [{ name: '', description: '', tech: '', link: '' }], // Added link
    certifications: [{ name: '', issuer: '', year: '' }] // NEW Certifications
  });

  return (
    <>
      {/* --- CSS Fix for input styling --- */}
      <style>{` .input-style { width: 100%; padding: 10px; background-color: #374151; border: 1px solid #4B5563; border-radius: 6px; color: white; font-size: 0.875rem; } .input-style::placeholder { color: #9CA3AF; } .input-style:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 2px #3B82F6; } .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        {isLoading ? ( <div className="text-center py-10"><h3 className="text-xl font-semibold text-white">Generating your resume...</h3><p className="text-gray-400">The AI is writing, please wait a moment.</p></div>
        ) : generatedResume ? ( <GeneratedResume resume={generatedResume} formData={formData} template={template} setGeneratedResume={setGeneratedResume} />
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4">AI Resume Builder</h3>
            <ResumeBuilderForm user={user} formData={formData} setFormData={setFormData} template={template} setTemplate={setTemplate} setIsLoading={setIsLoading} setGeneratedResume={setGeneratedResume} />
          </>
        )}
      </div>
    </>
  );
};

export default ResumeBuilderModule;