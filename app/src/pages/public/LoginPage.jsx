import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'client' });
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login — store user in localStorage
    localStorage.setItem('mhUser', JSON.stringify({ name: 'Yordanos T.', role: form.role, email: form.email }));
    if (form.role === 'client') navigate('/client/dashboard');
    else if (form.role === 'therapist') navigate('/therapist/dashboard');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-2">
            <Heart size={22} className="fill-primary" /> MindBridge
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your wellness account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Sign in as</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="client">Client / Patient</option>
                <option value="therapist">Therapist / Counselor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">Sign In</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
