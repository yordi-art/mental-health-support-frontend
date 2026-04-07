import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Client
import ClientDashboard from './pages/client/ClientDashboard';
import AssessmentPage from './pages/client/AssessmentPage';
import AssessmentResultPage from './pages/client/AssessmentResultPage';
import FindTherapistPage from './pages/client/FindTherapistPage';
import TherapistProfilePage from './pages/client/TherapistProfilePage';
import BookingPage from './pages/client/BookingPage';
import VideoSessionPage from './pages/client/VideoSessionPage';
import SessionHistoryPage from './pages/client/SessionHistoryPage';
import PaymentsPage from './pages/client/PaymentsPage';
import NotificationsPage from './pages/client/NotificationsPage';
import ReviewPage from './pages/client/ReviewPage';
import ProfilePage from './pages/client/ProfilePage';

// Therapist
import TherapistRegisterPage from './pages/therapist/TherapistRegisterPage';
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import VerificationDetailsPage from './pages/therapist/VerificationDetailsPage';
import ReuploadVerificationPage from './pages/therapist/ReuploadVerificationPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

const C = ({ role, children }) => <ProtectedRoute role={role}>{children}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client */}
        <Route path="/client/dashboard" element={<C role="client"><ClientDashboard /></C>} />
        <Route path="/client/assessment" element={<C role="client"><AssessmentPage /></C>} />
        <Route path="/client/results" element={<C role="client"><AssessmentResultPage /></C>} />
        <Route path="/client/therapists" element={<C role="client"><FindTherapistPage /></C>} />
        <Route path="/client/therapists/:id" element={<C role="client"><TherapistProfilePage /></C>} />
        <Route path="/client/book/:id" element={<C role="client"><BookingPage /></C>} />
        <Route path="/client/session" element={<C role="client"><VideoSessionPage /></C>} />
        <Route path="/client/sessions" element={<C role="client"><SessionHistoryPage /></C>} />
        <Route path="/client/payments" element={<C role="client"><PaymentsPage /></C>} />
        <Route path="/client/notifications" element={<C role="client"><NotificationsPage /></C>} />
        <Route path="/client/reviews/new/:therapistId" element={<C role="client"><ReviewPage /></C>} />
        <Route path="/client/profile" element={<C role="client"><ProfilePage /></C>} />

        {/* Therapist */}
        <Route path="/therapist/register" element={<TherapistRegisterPage />} />
        <Route path="/therapist/dashboard" element={<C role="therapist"><TherapistDashboard /></C>} />
        <Route path="/therapist/verification" element={<C role="therapist"><VerificationDetailsPage /></C>} />
        <Route path="/therapist/reupload" element={<C role="therapist"><ReuploadVerificationPage /></C>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<C role="admin"><AdminDashboard /></C>} />
        <Route path="/admin/verifications" element={<C role="admin"><AdminVerificationsPage /></C>} />
        <Route path="/admin/users" element={<C role="admin"><AdminUsersPage /></C>} />
        <Route path="/admin/reports" element={<C role="admin"><AdminReportsPage /></C>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
