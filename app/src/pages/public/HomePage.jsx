import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Calendar, Brain, Star, ChevronDown, ChevronUp, CheckCircle, BookOpen, DollarSign } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { publicAPI } from '../../api';

const features = [
  { icon: Brain,       title: 'AI Mental Health Assessment',    desc: 'Take PHQ-9 and GAD-7 assessments and get instant personalized insights.' },
  { icon: ShieldCheck, title: 'System-Verified Professionals',  desc: 'Every therapist license is automatically verified by our system.' },
  { icon: Video,       title: 'Secure Video Sessions',          desc: 'Connect with your therapist from home via encrypted video.' },
  { icon: Calendar,    title: 'Easy Appointment Booking',       desc: 'Browse availability and book sessions in seconds, 24/7.' },
];

const faqs = [
  { q: 'How does therapist verification work?',    a: 'Our system automatically validates uploaded license documents against official databases. No manual admin approval needed.' },
  { q: 'Is my data private?',                      a: 'Yes. All sessions and personal data are encrypted and never shared without your consent.' },
  { q: 'How do I get matched with a therapist?',   a: 'After completing a mental health assessment, our system recommends therapists based on your results and preferences.' },
  { q: 'Can I cancel or reschedule a session?',    a: 'Yes, you can reschedule or cancel up to 24 hours before your session from your dashboard.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="max-w-2xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-medium text-slate-700 text-sm">{f.q}</span>
              {open === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-gray-500">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function TherapistCard({ t }) {
  const initials = t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        {t.profileImage ? (
          <img src={t.profileImage} alt={t.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">{initials}</div>
        )}
        <div>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-slate-800">{t.name}</p>
            <CheckCircle size={14} className="text-teal-500" />
          </div>
          <p className="text-xs text-gray-500">{(t.specialization || []).join(', ')}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">{t.rating || '—'}</span>
            <span className="text-xs text-gray-400">({t.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2">{t.bio}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><BookOpen size={12} /> {t.experienceYears}y exp</span>
        <span className="flex items-center gap-1"><DollarSign size={12} /> ETB {t.hourlyRate}/hr</span>
      </div>
      <div className="flex gap-2 mt-auto">
        <Link to={`/therapists/${t._id}`} className="flex-1 text-center text-xs border border-primary text-primary rounded-lg py-1.5 hover:bg-blue-50 transition">View Profile</Link>
        <Link to="/register" className="flex-1 text-center text-xs bg-primary text-white rounded-lg py-1.5 hover:bg-blue-600 transition">Book Session</Link>
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
      <section className="bg-gradient-to-br from-blue-50 via-white to-teal-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">Mental Health Support Platform</span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-4">
            Your Mental Wellness,<br /><span className="text-primary">Supported Every Step</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Connect with system-verified therapists, take AI-powered assessments, and start your healing journey — safely and privately.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition">Get Started Free</Link>
            <Link to="/therapists" className="border border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">Find a Therapist</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Everything You Need for Mental Wellness</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-primary to-teal-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Take an Assessment', desc: 'Complete a quick PHQ-9 or GAD-7 mental health assessment.' },
              { step: '02', title: 'Get Matched',        desc: 'Our system recommends the best-fit verified therapist for you.' },
              { step: '03', title: 'Start Your Session', desc: 'Book and join a secure video session with your therapist.' },
            ].map(s => (
              <div key={s.step} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-4xl font-bold text-white/30 mb-2">{s.step}</div>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-white/80">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists — from DB only */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Meet Our Verified Therapists</h2>
          <Link to="/therapists" className="text-sm text-primary font-medium hover:underline">View All →</Link>
        </div>
        {therapists.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No verified therapists yet</p>
            <p className="text-sm mt-1">Therapists will appear here once their license is verified.</p>
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
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Ready to Start Your Wellness Journey?</h2>
        <p className="text-gray-500 mb-6">Join thousands of people who found support through MindBridge.</p>
        <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition inline-block">Create Free Account</Link>
      </section>
    </PublicLayout>
  );
}
