import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-2">
            <Heart size={22} className="fill-primary" /> MindBridge
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Reset your password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-teal-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-500 mb-4">We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span></p>
              <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder or <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">Send Reset Link</button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
