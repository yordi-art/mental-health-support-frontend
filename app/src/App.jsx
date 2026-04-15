import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Loading fallback ─────────────────────────────────────────────────────────
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Public ──────────────────────────────────────────────────────────────────
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const TherapistsPage = lazy(() => import('./pages/public/TherapistsPage'));
const TherapistDetailPage = lazy(() => import('./pages/public/TherapistDetailPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));

// ── Therapist Registration (public) ─────────────────────────────────────────
const TherapistRegisterPage = lazy(() => import('./pages/therapist/TherapistRegisterPage'));

// ── Client ──────────────────────────────────────────────────────────────────
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const AssessmentPage = lazy(() => import('./pages/client/AssessmentPage'));
const AssessmentResultPage = lazy(() => import('./pages/client/AssessmentResultPage'));
const FindTherapistPage = lazy(() => import('./pages/client/FindTherapistPage'));
const ClientTherapistProfilePage = lazy(() => import('./pages/client/TherapistProfilePage'));
const BookingPage = lazy(() => import('./pages/client/BookingPage'));
const AppointmentsPage = lazy(() => import('./pages/client/AppointmentsPage'));
const VideoSessionPage = lazy(() => import('./pages/client/VideoSessionPage'));
const SessionHistoryPage = lazy(() => import('./pages/client/SessionHistoryPage'));
const PaymentsPage = lazy(() => import('./pages/client/PaymentsPage'));
const PaymentCheckoutPage = lazy(() => import('./pages/client/PaymentCheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/client/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/client/PaymentFailedPage'));
const NotificationsPage = lazy(() => import('./pages/client/NotificationsPage'));
const ClientProfilePage = lazy(() => import('./pages/client/ProfilePage'));
const ReviewPage = lazy(() => import('./pages/client/ReviewPage'));

// ── Therapist ────────────────────────────────────────────────────────────────
const TherapistDashboard = lazy(() => import('./pages/therapist/TherapistDashboard'));
const VerificationDetailsPage = lazy(() => import('./pages/therapist/VerificationDetailsPage'));
const ReuploadVerificationPage = lazy(() => import('./pages/therapist/ReuploadVerificationPage'));
const AvailabilityPage = lazy(() => import('./pages/therapist/AvailabilityPage'));
const TherapistAppointmentsPage = lazy(() => import('./pages/therapist/TherapistAppointmentsPage'));
const ClientRequestsPage = lazy(() => import('./pages/therapist/ClientRequestsPage'));
const TherapistVideoSessionPage = lazy(() => import('./pages/therapist/TherapistVideoSessionPage'));
const TherapistReviewsPage = lazy(() => import('./pages/therapist/TherapistReviewsPage'));
const EarningsPage = lazy(() => import('./pages/therapist/EarningsPage'));
const TherapistProfilePage = lazy(() => import('./pages/therapist/TherapistProfilePage'));
const TherapistSettingsPage = lazy(() => import('./pages/therapist/TherapistSettingsPage'));

// ── Admin ────────────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/therapists" element={<TherapistsPage />} />
          <Route path="/therapists/:id" element={<TherapistDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/therapist/register" element={<TherapistRegisterPage />} />

          {/* ── Client ── */}
          <Route path="/client/dashboard" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/assessment" element={<ProtectedRoute role="client"><AssessmentPage /></ProtectedRoute>} />
          <Route path="/client/results" element={<ProtectedRoute role="client"><AssessmentResultPage /></ProtectedRoute>} />
          <Route path="/client/therapists" element={<ProtectedRoute role="client"><FindTherapistPage /></ProtectedRoute>} />
          <Route path="/client/therapists/:id" element={<ProtectedRoute role="client"><ClientTherapistProfilePage /></ProtectedRoute>} />
          <Route path="/client/book/:id" element={<ProtectedRoute role="client"><BookingPage /></ProtectedRoute>} />
          <Route path="/client/appointments" element={<ProtectedRoute role="client"><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/client/appointments/book" element={<ProtectedRoute role="client"><FindTherapistPage /></ProtectedRoute>} />
          <Route path="/client/session" element={<ProtectedRoute role="client"><VideoSessionPage /></ProtectedRoute>} />
          <Route path="/client/sessions" element={<ProtectedRoute role="client"><SessionHistoryPage /></ProtectedRoute>} />
          <Route path="/client/payments" element={<ProtectedRoute role="client"><PaymentsPage /></ProtectedRoute>} />
          <Route path="/client/payment/checkout" element={<ProtectedRoute role="client"><PaymentCheckoutPage /></ProtectedRoute>} />
          <Route path="/client/payment/success" element={<ProtectedRoute role="client"><PaymentSuccessPage /></ProtectedRoute>} />
          <Route path="/client/payment/failed" element={<ProtectedRoute role="client"><PaymentFailedPage /></ProtectedRoute>} />
          <Route path="/client/notifications" element={<ProtectedRoute role="client"><NotificationsPage /></ProtectedRoute>} />
          <Route path="/client/profile" element={<ProtectedRoute role="client"><ClientProfilePage /></ProtectedRoute>} />
          <Route path="/client/reviews/new/:therapistId" element={<ProtectedRoute role="client"><ReviewPage /></ProtectedRoute>} />

          {/* ── Therapist ── */}
          <Route path="/therapist/dashboard" element={<ProtectedRoute role="therapist"><TherapistDashboard /></ProtectedRoute>} />
          <Route path="/therapist/verification" element={<ProtectedRoute role="therapist"><VerificationDetailsPage /></ProtectedRoute>} />
          <Route path="/therapist/reupload" element={<ProtectedRoute role="therapist"><ReuploadVerificationPage /></ProtectedRoute>} />
          <Route path="/therapist/availability" element={<ProtectedRoute role="therapist"><AvailabilityPage /></ProtectedRoute>} />
          <Route path="/therapist/appointments" element={<ProtectedRoute role="therapist"><TherapistAppointmentsPage /></ProtectedRoute>} />
          <Route path="/therapist/requests" element={<ProtectedRoute role="therapist"><ClientRequestsPage /></ProtectedRoute>} />
          <Route path="/therapist/sessions" element={<ProtectedRoute role="therapist"><TherapistVideoSessionPage /></ProtectedRoute>} />
          <Route path="/therapist/reviews" element={<ProtectedRoute role="therapist"><TherapistReviewsPage /></ProtectedRoute>} />
          <Route path="/therapist/earnings" element={<ProtectedRoute role="therapist"><EarningsPage /></ProtectedRoute>} />
          <Route path="/therapist/profile" element={<ProtectedRoute role="therapist"><TherapistProfilePage /></ProtectedRoute>} />
          <Route path="/therapist/settings" element={<ProtectedRoute role="therapist"><TherapistSettingsPage /></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute role="admin"><AdminVerificationsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointmentsPage /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPaymentsPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute role="admin"><AdminReviewsPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettingsPage /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
