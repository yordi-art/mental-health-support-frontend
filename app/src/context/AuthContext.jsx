import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, therapistAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVerification = useCallback(async () => {
    try {
      const res = await therapistAPI.getVerificationStatus();
      setVerificationStatus(res.data.verification?.status ?? 'PENDING');
    } catch {
      setVerificationStatus('PENDING');
    }
  }, []);

  const loadUser = useCallback(async () => {
    const stored = JSON.parse(localStorage.getItem('mhUser') || 'null');
    if (!stored?.token) { setLoading(false); return; }
    try {
      const res = await authAPI.getProfile();
      const fresh = { ...(res.data.user || res.data), token: stored.token };
      setUser(fresh);
      localStorage.setItem('mhUser', JSON.stringify(fresh));
      if (fresh.role === 'therapist') await fetchVerification();
    } catch {
      localStorage.removeItem('mhUser');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchVerification]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token, user: u } = res.data;
    const stored = { ...u, token };
    localStorage.setItem('mhUser', JSON.stringify(stored));
    setUser(stored);
    if (u.role === 'therapist') await fetchVerification();
    return u;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user: u } = res.data;
    const stored = { ...u, token };
    localStorage.setItem('mhUser', JSON.stringify(stored));
    setUser(stored);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('mhUser');
    setUser(null);
    setVerificationStatus(null);
  };

  return (
    <AuthContext.Provider value={{ user, verificationStatus, loading, login, logout, register, refetchVerification: fetchVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
