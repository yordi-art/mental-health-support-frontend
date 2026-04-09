import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import PublicTherapistsPage from './pages/public/TherapistsPage';
import PublicTherapistDetailPage from './pages/public/TherapistDetailPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Client
import ClientDashboard from './pages/client/ClientDashboard';
import AssessmentPage from './pages/client/AssessmentPage';
import AssessmentResultPage from './pages/client/AssessmentResultPage';
import FindTherapistPage from './pages/client/FindTherapistPage';
import ClientTherapistProfilePage from './pages/client/TherapistProfilePage';
import BookingPage from './pages/client/BookingPage';
import AppointmentsPage from './pages/client/AppointmentsPage';
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
import AvailabilityPage from './pages/therapist/AvailabilityPage';
import TherapistAppointmentsPage from './pages/therapist/TherapistAppointmentsPage';
import ClientRequestsPage from './pages/therapist/ClientRequestsPage';
import TherapistVideoSessionPage from './pages/therapist/TherapistVideoSessionPage';
import TherapistReviewsPage from './pages/therapist/TherapistReviewsPage';
import EarningsPage from './pages/therapist/EarningsPage';
import TherapistOwnProfilePage from './pages/therapist/TherapistProfilePage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const C = ({ role, children }) => <ProtectedRoute role={role}>{children}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/therapists" element={<PublicTherapistsPage />} />
        <Route path="/therapists/:id" element={<PublicTherapistDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Client */}
        <Route path="/client/dashboard" element={<C role="client"><ClientDashboard /></C>} />
        <Route path="/client/assessment" element={<C role="client"><AssessmentPage /></C>} />
        <Route path="/client/results" element={<C role="client"><AssessmentResultPage /></C>} />
        <Route path="/client/therapists" element={<C role="client"><FindTherapistPage /></C>} />
        <Route path="/client/therapists/:id" element={<C role="client"><ClientTherapistProfilePage /></C>} />
        <Route path="/client/book/:id" element={<C role="client"><BookingPage /></C>} />
        <Route path="/client/appointments" element={<C role="client"><AppointmentsPage /></C>} />
        <Route path="/client/sessions" element={<C role="client"><SessionHistoryPage /></C>} />
        <Route path="/client/session" element={<C role="client"><VideoSessionPage /></C>} />
        <Route path="/client/payments" element={<C role="client"><PaymentsPage /></C>} />
        <Route path="/client/notifications" element={<C role="client"><NotificationsPage /></C>} />
        <Route path="/client/reviews/new/:therapistId" element={<C role="client"><ReviewPage /></C>} />
        <Route path="/client/profile" element={<C role="client"><ProfilePage /></C>} />

        {/* Therapist */}
        <Route path="/therapist/register" element={<TherapistRegisterPage />} />
        <Route path="/therapist/dashboard" element={<C role="therapist"><TherapistDashboard /></C>} />
        <Route path="/therapist/verification" element={<C role="therapist"><VerificationDetailsPage /></C>} />
        <Route path="/therapist/reupload" element={<C role="therapist"><ReuploadVerificationPage /></C>} />
        <Route path="/therapist/availability" element={<C role="therapist"><AvailabilityPage /></C>} />
        <Route path="/therapist/appointments" element={<C role="therapist"><TherapistAppointmentsPage /></C>} />
        <Route path="/therapist/requests" element={<C role="therapist"><ClientRequestsPage /></C>} />
        <Route path="/therapist/sessions" element={<C role="therapist"><TherapistVideoSessionPage /></C>} />
        <Route path="/therapist/reviews" element={<C role="therapist"><TherapistReviewsPage /></C>} />
        <Route path="/therapist/earnings" element={<C role="therapist"><EarningsPage /></C>} />
        <Route path="/therapist/profile" element={<C role="therapist"><TherapistOwnProfilePage /></C>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<C role="admin"><AdminDashboard /></C>} />
        <Route path="/admin/verifications" element={<C role="admin"><AdminVerificationsPage /></C>} />
        <Route path="/admin/users" element={<C role="admin"><AdminUsersPage /></C>} />
        <Route path="/admin/appointments" element={<C role="admin"><AdminAppointmentsPage /></C>} />
        <Route path="/admin/payments" element={<C role="admin"><AdminPaymentsPage /></C>} />
        <Route path="/admin/reports" element={<C role="admin"><AdminReportsPage /></C>} />
        <Route path="/admin/reviews" element={<C role="admin"><AdminReviewsPage /></C>} />
        <Route path="/admin/analytics" element={<C role="admin"><AdminAnalyticsPage /></C>} />
        <Route path="/admin/settings" element={<C role="admin"><AdminSettingsPage /></C>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
