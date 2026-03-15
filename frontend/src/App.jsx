import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PracticeSession from './pages/PracticeSession';
import UploadSolution from './pages/UploadSolution';
import UploadMaterial from './pages/UploadMaterial';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Loader from './components/Loader';
import Home from './pages/Home';

// Home Route wrapper to handle initial site loading
const HomeRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Initializing" />;
  }

  return children;
};

// Protected Route wrapper - Strictly redirects to Home if no session exists
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Checking session" />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Loading" />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route 
            path="/" 
            element={
              <HomeRoute>
                <Home />
              </HomeRoute>
            } 
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/session" element={<PracticeSession />} />
            <Route path="/upload-solution" element={<UploadSolution />} />
            <Route path="/upload-material" element={<UploadMaterial />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
