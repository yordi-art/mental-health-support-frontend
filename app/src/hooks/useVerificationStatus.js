import { useState, useEffect } from 'react';
import { therapistAPI } from '../api';

export default function useVerificationStatus() {
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    therapistAPI.getVerificationStatus()
      .then(res => {
        setStatus(res.data.verification?.status || 'PENDING');
        setNotes(res.data.verification?.notes || '');
      })
      .catch(() => {
        const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
        setStatus(user.verificationStatus || 'PENDING');
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    status,
    notes,
    loading,
    isVerified: status === 'VERIFIED',
    isBlocked: status !== 'VERIFIED',
  };
}
