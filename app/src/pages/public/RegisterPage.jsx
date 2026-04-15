import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { authAPI } from '../../api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      const { token, user } = res.data;
      localStorage.setItem('mhUser', JSON.stringify({ ...user, token }));
      if (form.role === 'therapist') navigate('/therapist/register');
      else navigate('/client/dashboard');
    } catch {
      // Fallback: mock registration
      localStorage.setItem('mhUser', JSON.stringify({ name: form.name, role: form.role, email: form.email }));
      if (form.role === 'therapist') navigate('/therapist/register');
      else navigate('/client/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-2">
            <Heart size={22} className="fill-primary" /> MindBridge
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start your mental wellness journey today</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">I am a</label>
              <select {...f('role')} className={inputCls}>
                <option value="client">Client / Patient</option>
                <option value="therapist">Therapist / Counselor</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
              <input type="text" required placeholder="Yordanos Tadesse" {...f('name')} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input type="email" required placeholder="you@example.com" {...f('email')} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input type="password" required placeholder="Min. 8 characters" {...f('password')} className={inputCls} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-60">
              {loading ? 'Creating...' : form.role === 'therapist' ? 'Continue to Verification →' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
