import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { GeoLocation } from './components/GeoLocation';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-agro-gradient flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return session ? <>{children}</> : null;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route
          path="/geolocation"
          element={
            <ProtectedRoute>
              <GeoLocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:areaId"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;