import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

const navLinks = [
  { label: 'Home',          to: '/' },
  { label: 'About',         to: '/about' },
  { label: 'How It Works',  to: '/how-it-works' },
  { label: 'Find Therapist',to: '/therapists' },
  { label: 'Contact',       to: '/contact' },
  { label: 'FAQ',           to: '/faq' },
];

export default function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <Heart size={16} className="fill-white text-white" />
            </div>
            MindBridge
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === l.to
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login"
              className="text-sm text-gray-600 hover:text-primary font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition">
              Sign In
            </Link>
            <Link to="/register"
              className="text-sm bg-brand-gradient text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition shadow-sm">
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${pathname === l.to ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                {l.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-2">
              <Link to="/login" className="px-3 py-2.5 text-sm text-primary font-medium">Sign In</Link>
              <Link to="/register" className="text-sm bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-center font-semibold">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 pt-14 pb-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                <Heart size={16} className="fill-white text-white" />
              </div>
              MindBridge
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              A safe, private platform connecting people with verified mental health professionals across Ethiopia.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Quick Links</p>
            <div className="space-y-2">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className="block text-sm text-gray-400 hover:text-white transition">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Contact</p>
            <div className="space-y-2 text-sm">
              <p>support@mindbridge.et</p>
              <p>+251 911 000 000</p>
              <p>Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">© 2025 MindBridge. All rights reserved.</p>
          <p className="text-xs text-gray-500">Built for mental wellness in Ethiopia</p>
        </div>
      </footer>
    </div>
  );
}
