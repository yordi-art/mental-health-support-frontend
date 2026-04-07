import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Calendar, Brain, Star, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import TherapistCard from '../../components/common/TherapistCard';
import { therapists, testimonials } from '../../data/sampleData';
import { useState } from 'react';

const features = [
  { icon: Brain, title: 'AI Mental Health Assessment', desc: 'Take PHQ-9 and GAD-7 assessments and get instant personalized insights.' },
  { icon: ShieldCheck, title: 'System-Verified Professionals', desc: 'Every therapist license is automatically verified by our system — not manually.' },
  { icon: Video, title: 'Secure Video Sessions', desc: 'Connect with your therapist from the comfort of your home via encrypted video.' },
  { icon: Calendar, title: 'Easy Appointment Booking', desc: 'Browse availability and book sessions in seconds, 24/7.' },
];

const faqs = [
  { q: 'How does therapist verification work?', a: 'Our system automatically validates uploaded license documents against official databases. No manual admin approval needed.' },
  { q: 'Is my data private?', a: 'Yes. All sessions and personal data are encrypted and never shared without your consent.' },
  { q: 'How do I get matched with a therapist?', a: 'After completing a mental health assessment, our system recommends therapists based on your results and preferences.' },
  { q: 'Can I cancel or reschedule a session?', a: 'Yes, you can reschedule or cancel up to 24 hours before your session from your dashboard.' },
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

export default function HomePage() {
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
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500">
            {['1,200+ Clients Helped', '87 Verified Therapists', '4.9★ Average Rating'].map(t => (
              <div key={t} className="flex items-center gap-1"><CheckCircle size={14} className="text-teal-500" />{t}</div>
            ))}
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
              { step: '02', title: 'Get Matched', desc: 'Our system recommends the best-fit verified therapist for you.' },
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

      {/* Featured Therapists */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Meet Our Verified Therapists</h2>
          <Link to="/therapists" className="text-sm text-primary font-medium hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {therapists.map(t => <TherapistCard key={t.id} t={t} />)}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-600 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-slate-700">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
