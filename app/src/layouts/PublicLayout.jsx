import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Find Therapist', to: '/therapists' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
];

export default function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Heart size={20} className="fill-primary" /> MindBridge
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`text-sm font-medium transition ${pathname === l.to ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-primary font-medium">Sign In</Link>
            <Link to="/register" className="text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition font-medium">Get Started</Link>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
            {navLinks.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-gray-700">{l.label}</Link>)}
            <Link to="/login" className="text-sm text-primary font-medium">Sign In</Link>
            <Link to="/register" className="text-sm bg-primary text-white px-4 py-2 rounded-xl text-center">Get Started</Link>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-800 text-gray-300 py-10 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <Heart size={18} className="fill-white" /> MindBridge
            </div>
            <p className="text-sm text-gray-400">A safe space for mental wellness. Connect with verified therapists anytime.</p>
          </div>
          <div>
            <p className="text-white font-medium mb-2">Quick Links</p>
            {navLinks.map(l => <Link key={l.to} to={l.to} className="block text-sm text-gray-400 hover:text-white mb-1">{l.label}</Link>)}
          </div>
          <div>
            <p className="text-white font-medium mb-2">Contact</p>
            <p className="text-sm text-gray-400">support@mindbridge.et</p>
            <p className="text-sm text-gray-400">+251 911 000 000</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-8">© 2025 MindBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
