import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // We need a new library
import { auth } from './firebase';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

// This component protects routes that require a user to be logged in
function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    // Show a loading screen while Firebase checks auth state
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <h1 className="text-3xl text-white">Loading...</h1>
      </div>
    );
  }
  if (!user) {
    // If not logged in and not loading, redirect to auth page
    return <Navigate to="/auth" replace />;
  }
  // If logged in, show the child component (DashboardPage)
  return children;
}

function App() {
  // 'useAuthState' is a "hook" that listens to Firebase auth state in real-time
  // It gives us the 'user' object, 'loading' status, and any 'error'
  const [user, loading, error] = useAuthState(auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: Landing Page (public) */}
        <Route path="/" element={<LandingPage />} />

        {/* Route 2: Auth Page (public, but redirects if logged in) */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />

        {/* Route 3: Dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <DashboardPage user={user} />
            </ProtectedRoute>
          }
        />
        {/* --- ADD THIS ENTIRE BLOCK --- */}
        <Route
          path="/history"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <HistoryPage user={user} />
            </ProtectedRoute>
          }
        />
        
        {/* Optional: Redirect any unknown routes back to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;