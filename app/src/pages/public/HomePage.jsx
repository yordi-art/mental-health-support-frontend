import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Calendar, Brain, Star, ChevronDown, ChevronUp, CheckCircle, ArrowRight } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { publicAPI } from '../../api';

const features = [
  { icon: Brain,       color: 'bg-blue-50 text-primary',   title: 'AI Mental Health Assessment',   desc: 'Take PHQ-9 and GAD-7 assessments and get instant personalized insights powered by machine learning.' },
  { icon: ShieldCheck, color: 'bg-teal-50 text-teal-500',  title: 'Verified Professionals',        desc: 'Every therapist license is automatically verified by our AI system before they can see clients.' },
  { icon: Video,       color: 'bg-purple-50 text-purple-500', title: 'Secure Video Sessions',      desc: 'Connect with your therapist from home via encrypted, private video calls.' },
  { icon: Calendar,    color: 'bg-amber-50 text-amber-500', title: 'Easy Appointment Booking',     desc: 'Browse real-time availability and book sessions in seconds, 24/7.' },
];

const faqs = [
  { q: 'How does therapist verification work?',  a: 'Our AI system automatically validates uploaded license documents — checking license number, issuing authority, and expiry date. No manual admin approval needed.' },
  { q: 'Is my data private?',                    a: 'Yes. All sessions and personal data are encrypted end-to-end and never shared without your explicit consent.' },
  { q: 'How do I get matched with a therapist?', a: 'After completing a mental health assessment, our AI recommends therapists based on your results, severity level, and specialization match.' },
  { q: 'Can I cancel or reschedule a session?',  a: 'Yes, you can reschedule or cancel up to 24 hours before your session from your dashboard without any penalty.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <span className="inline-block bg-blue-50 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">FAQ</span>
        <h2 className="text-2xl font-bold text-slate-800">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
              onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-medium text-slate-700 text-sm">{f.q}</span>
              {open === i
                ? <ChevronUp size={15} className="text-primary flex-shrink-0" />
                : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function TherapistCard({ t }) {
  const initials = t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {t.profileImage ? (
          <img src={t.profileImage} alt={t.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold flex-shrink-0">{initials}</div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-slate-800">{t.name}</p>
            <CheckCircle size={13} className="text-teal-500" />
          </div>
          <p className="text-xs text-gray-500">{(t.specialization || []).slice(0, 2).join(', ')}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">{t.rating || '—'}</span>
            <span className="text-xs text-gray-400">({t.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.bio}</p>
      <div className="flex gap-2 mt-auto">
        <Link to={`/therapists/${t._id}`}
          className="flex-1 text-center text-xs border border-gray-200 text-gray-600 rounded-xl py-2 hover:bg-gray-50 transition font-medium">
          View Profile
        </Link>
        <Link to="/register"
          className="flex-1 text-center text-xs bg-primary text-white rounded-xl py-2 hover:bg-primary-dark transition font-semibold">
          Book Session
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    publicAPI.getTherapists({ limit: 3 })
      .then(res => setTherapists(res.data?.slice?.(0, 3) || []))
      .catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-hero-gradient py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-teal-DEFAULT/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-block bg-blue-100 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            Mental Health Support Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-5">
            Your Mental Wellness,<br />
            <span className="text-transparent bg-clip-text bg-brand-gradient">Supported Every Step</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Connect with AI-verified therapists, take clinically validated assessments, and start your healing journey — safely and privately.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="bg-brand-gradient text-white px-7 py-3.5 rounded-xl font-semibold hover:opacity-90 transition shadow-md flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/therapists"
              className="bg-white border border-gray-200 text-slate-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition shadow-sm">
              Find a Therapist
            </Link>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-10 text-xs text-gray-400">
            {['AI-Verified Therapists', 'End-to-End Encrypted', 'PHQ-9 & GAD-7 Assessments', 'Secure Video Sessions'].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-teal-500" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-50 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">Features</span>
          <h2 className="text-2xl font-bold text-slate-800">Everything You Need for Mental Wellness</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 border border-gray-100">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-brand-gradient py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">How It Works</span>
          <h2 className="text-2xl font-bold mb-12">Three Steps to Better Mental Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Take an Assessment', desc: 'Complete a quick PHQ-9 or GAD-7 mental health assessment in under 5 minutes.' },
              { step: '02', title: 'Get AI-Matched',     desc: 'Our AI recommends the best-fit verified therapist based on your results.' },
              { step: '03', title: 'Start Your Session', desc: 'Book and join a secure, encrypted video session with your therapist.' },
            ].map(s => (
              <div key={s.step} className="bg-white/10 backdrop-blur-sm rounded-2xl p-7 border border-white/20 text-left">
                <div className="text-5xl font-extrabold text-white/20 mb-3 leading-none">{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/75 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['1,200+', 'Clients Helped'], ['87', 'Verified Therapists'], ['3,400+', 'Sessions Completed'], ['4.9★', 'Average Rating']].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-brand-gradient">{val}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block bg-teal-50 text-teal-500 text-xs font-semibold px-3 py-1 rounded-full mb-2">Our Therapists</span>
            <h2 className="text-2xl font-bold text-slate-800">Meet Our Verified Therapists</h2>
          </div>
          <Link to="/therapists" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {therapists.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <ShieldCheck size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-400">No verified therapists yet</p>
            <p className="text-sm text-gray-400 mt-1">Therapists will appear here once their license is verified.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {therapists.map(t => <TherapistCard key={t._id} t={t} />)}
          </div>
        )}
      </section>

      <FAQ />

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-hero-gradient rounded-3xl border border-gray-100 p-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Ready to Start Your Wellness Journey?</h2>
          <p className="text-gray-500 mb-7 text-sm">Join thousands of people who found support through MindBridge.</p>
          <Link to="/register"
            className="bg-brand-gradient text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center gap-2 shadow-md">
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
