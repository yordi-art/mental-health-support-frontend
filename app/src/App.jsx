import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Client
import ClientDashboard from './pages/client/ClientDashboard';
import AssessmentPage from './pages/client/AssessmentPage';
import FindTherapistPage from './pages/client/FindTherapistPage';
import VideoSessionPage from './pages/client/VideoSessionPage';

// Therapist
import TherapistRegisterPage from './pages/therapist/TherapistRegisterPage';
import TherapistDashboard from './pages/therapist/TherapistDashboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client */}
        <Route path="/client/dashboard" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/assessment" element={<ProtectedRoute role="client"><AssessmentPage /></ProtectedRoute>} />
        <Route path="/client/therapists" element={<ProtectedRoute role="client"><FindTherapistPage /></ProtectedRoute>} />
        <Route path="/client/session" element={<ProtectedRoute role="client"><VideoSessionPage /></ProtectedRoute>} />

        {/* Therapist */}
        <Route path="/therapist/register" element={<TherapistRegisterPage />} />
        <Route path="/therapist/dashboard" element={<ProtectedRoute role="therapist"><TherapistDashboard /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
