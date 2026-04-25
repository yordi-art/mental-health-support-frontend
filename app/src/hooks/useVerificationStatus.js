import { useAuth } from '../context/AuthContext';

export default function useVerificationStatus() {
  const { verificationStatus, loading } = useAuth();
  const status = verificationStatus || 'VERIFIED';

  return {
    status,
    loading,
    isVerified: true,   // DEV_MODE: always verified
    isBlocked:  false,  // DEV_MODE: never blocked
  };
}
