
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CommunityPage from '@/pages/CommunityPage';
import ProfilePage from '@/pages/ProfilePage';
import SharedLocationViewPage from '@/pages/SharedLocationViewPage'; // Nueva página

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-white">Cargando...</p></div>; // O un spinner más elegante
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/view-share/:shareId" element={<SharedLocationViewPage />} /> {/* Ruta para ver ubicación compartida */}
          </Routes>
        </MainLayout>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
  