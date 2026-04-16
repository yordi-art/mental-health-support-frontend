import { useAuth } from '../context/AuthContext';

export default function useVerificationStatus() {
  const { verificationStatus, loading } = useAuth();
  const status = verificationStatus;

  return {
    status,
    loading,
    isVerified: status === 'VERIFIED',
    isBlocked: status !== 'VERIFIED',
  };
}
