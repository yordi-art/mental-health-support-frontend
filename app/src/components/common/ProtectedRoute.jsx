import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VERIFICATION_ROUTES = {
  PENDING: '/therapist/verification',
  REJECTED: '/therapist/reupload',
  EXPIRED: '/therapist/reupload',
};

export default function ProtectedRoute({ children, role }) {
  const { user, verificationStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  if (user.role === 'therapist' && verificationStatus && verificationStatus !== 'VERIFIED') {
    const redirect = VERIFICATION_ROUTES[verificationStatus];
    // Allow access to verification-related pages regardless of status
    const allowed = ['/therapist/verification', '/therapist/reupload'];
    const currentPath = window.location.pathname;
    if (redirect && !allowed.includes(currentPath)) {
      return <Navigate to={redirect} replace />;
    }
  }

  return children;
}
