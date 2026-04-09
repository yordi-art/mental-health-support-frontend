import { Heart, ShieldCheck, Users, Brain, Target, Eye } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';

const values = [
  { icon: Heart, title: 'Compassion First', desc: 'Every feature is designed with empathy and emotional safety in mind.' },
  { icon: ShieldCheck, title: 'Trust & Privacy', desc: 'Your data is encrypted and your sessions are completely confidential.' },
  { icon: Brain, title: 'Evidence-Based', desc: 'We use clinically validated tools like PHQ-9 and GAD-7 for assessments.' },
  { icon: Users, title: 'Community', desc: 'A growing network of verified professionals dedicated to your wellness.' },
];

const team = [
  { name: 'Yordanos Tadesse', role: 'Founder & CEO', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Biruk Mekonnen', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Selam Girma', role: 'Clinical Advisor', avatar: 'https://i.pravatar.cc/150?img=9' },
  { name: 'Dawit Alemu', role: 'UX Designer', avatar: 'https://i.pravatar.cc/150?img=15' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-20 px-4 text-center">
        <span className="inline-block bg-blue-100 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">About MindBridge</span>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Mental wellness for everyone,<br /><span className="text-primary">accessible and trusted</span></h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">MindBridge was built to break down barriers to mental health support — connecting people with verified professionals in a safe, private, and modern platform.</p>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-3"><Target size={18} /> Our Mission</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Making mental health support accessible to all Ethiopians</h2>
          <p className="text-gray-500 text-sm leading-relaxed">We believe mental health care should be as accessible as any other healthcare service. MindBridge provides a digital bridge between those who need support and qualified professionals who can provide it — safely, privately, and affordably.</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold mb-3"><Eye size={18} /> Our Vision</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">A society where mental wellness is normalized</h2>
          <p className="text-gray-500 text-sm leading-relaxed">We envision a future where seeking mental health support carries no stigma, where every person has access to a verified therapist, and where technology empowers healing rather than replacing human connection.</p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <v.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Meet the Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map(m => (
            <div key={m.name} className="text-center">
              <img src={m.avatar} alt={m.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
              <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
              <p className="text-xs text-gray-500">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-primary to-teal-500 py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[['1,200+', 'Clients Helped'], ['87', 'Verified Therapists'], ['3,400+', 'Sessions Completed'], ['4.9★', 'Average Rating']].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold">{val}</p>
              <p className="text-sm text-white/80 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
