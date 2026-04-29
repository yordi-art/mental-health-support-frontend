import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, ChevronRight, Stethoscope, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Therapists go to the dedicated registration page — no API call here
    if (form.role === 'therapist') {
      // Store basic info temporarily so TherapistRegisterPage can pre-fill
      sessionStorage.setItem('therapistBasic', JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }));
      navigate('/therapist/register');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'client',
      });
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });
  const inputCls = 'w-full border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition';

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart size={20} className="fill-white text-white" />
            </div>
            MindBridge
          </Link>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-white/70 text-sm mt-2">Start your mental wellness journey today</p>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-7 shadow-2xl">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'client', label: 'Client', sub: 'Seek support', Icon: UserCircle },
              { value: 'therapist', label: 'Therapist', sub: 'Provide care', Icon: Stethoscope },
            ].map(({ value, label, sub, Icon }) => (
              <button
                key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200
                  ${form.role === value ? 'border-white bg-white/25 shadow-lg scale-[1.02]' : 'border-white/20 hover:border-white/40 hover:bg-white/10'}`}
              >
                <Icon size={22} className="text-white" />
                <span className="text-white font-semibold text-sm">{label}</span>
                <span className="text-white/60 text-xs">{sub}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
              <input type="text" required placeholder="Full Name" {...f('name')} className={`${inputCls} pl-10`} />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
              <input type="email" required placeholder="Email address" {...f('email')} className={`${inputCls} pl-10`} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
              <input type="password" required placeholder="Password (min. 8 characters)" minLength={8} {...f('password')} className={`${inputCls} pl-10`} />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-white text-sm rounded-xl px-4 py-2.5">{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                hover:bg-white/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                <>
                  {form.role === 'therapist' ? 'Continue to Verification' : 'Create Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline underline-offset-2">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
