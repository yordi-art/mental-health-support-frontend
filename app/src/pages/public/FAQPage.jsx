import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';

const faqs = [
  { category: 'General', q: 'What is MindBridge?', a: 'MindBridge is a mental health support platform that connects clients with verified therapists for online sessions, assessments, and ongoing wellness support.' },
  { category: 'General', q: 'Is MindBridge free to use?', a: 'Creating an account and taking assessments is free. Sessions with therapists are paid based on the therapist\'s rate.' },
  { category: 'Therapists', q: 'How does therapist verification work?', a: 'Our system automatically validates uploaded license documents against official databases. The process checks license number, issuing authority, and document authenticity — no manual admin approval needed.' },
  { category: 'Therapists', q: 'How long does verification take?', a: 'System verification typically completes within 2–5 minutes after document submission.' },
  { category: 'Sessions', q: 'How do I book a session?', a: 'Complete a mental health assessment, get matched with a therapist, browse their availability, and book a time slot that works for you.' },
  { category: 'Sessions', q: 'Can I cancel or reschedule a session?', a: 'Yes, you can reschedule or cancel up to 24 hours before your session from your dashboard without any penalty.' },
  { category: 'Privacy', q: 'Is my data private?', a: 'Absolutely. All sessions and personal data are encrypted end-to-end and never shared without your explicit consent.' },
  { category: 'Privacy', q: 'Are video sessions recorded?', a: 'No. Video sessions are never recorded or stored. They are live, encrypted, and completely private.' },
  { category: 'Payments', q: 'What payment methods are accepted?', a: 'We accept major mobile payment methods including Telebirr, CBE Birr, and bank transfers.' },
  { category: 'Payments', q: 'What if I\'m not satisfied with a session?', a: 'We have a satisfaction policy. If you\'re not satisfied with your first session, contact our support team within 24 hours.' },
];

const categories = ['All', ...new Set(faqs.map(f => f.category))];

export default function FAQPage() {
  const [open, setOpen] = useState(null);
  const [cat, setCat] = useState('All');

  const filtered = faqs.filter(f => cat === 'All' || f.category === cat);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Frequently Asked <span className="text-primary">Questions</span></h1>
        <p className="text-gray-500 max-w-md mx-auto">Everything you need to know about MindBridge. Can't find an answer? Contact our support team.</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${cat === c ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{c}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-medium text-slate-700 text-sm">{f.q}</span>
                {open === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
