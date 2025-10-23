import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navbar/Header */}
      <header className="w-full bg-gray-800 p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">AI Resume Pro</h1>
          <Link
            to="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
          >
            Get Started / Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center p-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-extrabold text-white mb-4 leading-tight">
            The Future of Job Applications is <span className="text-green-400">Automated.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Stop guessing what ATS wants. Instantly evaluate your existing resume
            or generate a perfectly optimized resume tailored to any job role, powered by GPT-4o.
          </p>
          <Link
            to="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg text-xl transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Your Free Evaluation
          </Link>
        </div>
      </section>

      {/* Feature Section (Two Columns) */}
      <section className="bg-gray-800 p-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Feature 1: Evaluation */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border-t-4 border-blue-500">
            <h3 className="text-3xl font-bold text-white mb-3 flex items-center">
              <span className="text-blue-400 mr-3">✓</span> AI Evaluation
            </h3>
            <p className="text-lg text-gray-400 mb-4">
              Upload any PDF/DOCX and get a score against your target job description.
            </p>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• ATS Match Percentage Score</li>
              <li>• Grammar & Readability Check</li>
              <li>• Section-by-Section Improvement Suggestions</li>
            </ul>
          </div>
          
          {/* Feature 2: Generation */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border-t-4 border-green-500">
            <h3 className="text-3xl font-bold text-white mb-3 flex items-center">
              <span className="text-green-400 mr-3">✨</span> Resume Builder
            </h3>
            <p className="text-lg text-gray-400 mb-4">
              Enter your raw data and instantly generate a professional, optimized document.
            </p>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Automatic Action-Verb Optimization</li>
              <li>• Multiple Professional Templates (Classic/Modern)</li>
              <li>• One-Click PDF Download</li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-gray-900 py-4 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AI Resume Pro. Built with React, Node.js, and OpenAI.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;