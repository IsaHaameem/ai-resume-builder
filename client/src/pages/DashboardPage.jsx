import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom'; // Import Link for navigation
import UploadModule from '../components/UploadModule';
import ResumeBuilderModule from '../components/ResumeBuilderModule';

// We pass the 'user' object from App.jsx as a prop
const DashboardPage = ({ user }) => {
  
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        // The `useAuthState` hook in App.jsx will detect this
        // and automatically redirect to the /auth page.
        console.log('User logged out');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <div className="flex gap-4"> {/* Wrapper for layout */}
            
            {/* --- ADD THIS LINK --- */}
            <Link 
              to="/history"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              View History
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome, {user?.displayName || user?.email}!
          </h2>
          <p className="text-gray-300">
            You're all set! From here you can upload a resume for evaluation or
            build a new one from scratch.
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* We now pass the user prop down */}
          <UploadModule user={user} />
          
          {/* We now pass the user prop down */}
          <ResumeBuilderModule user={user} />

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;