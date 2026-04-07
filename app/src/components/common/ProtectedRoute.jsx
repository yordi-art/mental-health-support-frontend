import { Navigate } from 'react-router-dom';

// Simple role-based guard using localStorage token
export default function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('mhUser') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
