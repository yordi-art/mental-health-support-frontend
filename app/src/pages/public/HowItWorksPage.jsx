import { ClipboardList, UserCheck, Video, Calendar, ShieldCheck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';

const clientSteps = [
  { icon: ClipboardList, step: '01', title: 'Take a Mental Health Assessment', desc: 'Complete a clinically validated PHQ-9 or GAD-7 questionnaire. Takes less than 5 minutes.' },
  { icon: UserCheck, step: '02', title: 'Get Matched with a Therapist', desc: 'Our system recommends the best-fit verified therapist based on your results and preferences.' },
  { icon: Calendar, step: '03', title: 'Book Your Session', desc: 'Browse therapist availability and book a session at a time that works for you.' },
  { icon: CreditCard, step: '04', title: 'Pay Securely', desc: 'Complete your payment through our secure payment gateway.' },
  { icon: Video, step: '05', title: 'Join Your Video Session', desc: 'Connect with your therapist via encrypted video call from anywhere.' },
];

const therapistSteps = [
  { icon: UserCheck, step: '01', title: 'Register as a Therapist', desc: 'Create your professional profile with your specialization, experience, and bio.' },
  { icon: ShieldCheck, step: '02', title: 'Submit for System Verification', desc: 'Upload your professional license. Our system automatically validates your credentials.' },
  { icon: Calendar, step: '03', title: 'Set Your Availability', desc: 'Define your working hours and available time slots for client bookings.' },
  { icon: Video, step: '04', title: 'Accept Clients & Start Sessions', desc: 'Review client requests, accept appointments, and conduct secure video sessions.' },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-20 px-4 text-center">
        <span className="inline-block bg-blue-100 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">How It Works</span>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Simple steps to better <span className="text-primary">mental wellness</span></h1>
        <p className="text-gray-500 max-w-xl mx-auto">Whether you're seeking support or providing it, MindBridge makes the process seamless and trustworthy.</p>
      </section>

      {/* For Clients */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center"><UserCheck size={16} className="text-white" /></div>
          <h2 className="text-2xl font-bold text-slate-800">For Clients</h2>
        </div>
        <div className="space-y-4">
          {clientSteps.map((s, i) => (
            <div key={s.step} className="flex gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <s.icon size={22} className="text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-full">Step {s.step}</span>
                  <h3 className="font-semibold text-slate-800">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition inline-block">Get Started as a Client</Link>
        </div>
      </section>

      {/* For Therapists */}
      <section className="bg-teal-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center"><ShieldCheck size={16} className="text-white" /></div>
            <h2 className="text-2xl font-bold text-slate-800">For Therapists</h2>
          </div>
          <div className="space-y-4">
            {therapistSteps.map(s => (
              <div key={s.step} className="flex gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
                  <s.icon size={22} className="text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Step {s.step}</span>
                    <h3 className="font-semibold text-slate-800">{s.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/therapist/register" className="bg-teal-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-600 transition inline-block">Join as a Therapist</Link>
          </div>
        </div>
      </section>

      {/* System Verification Highlight */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-10 border border-blue-100">
          <ShieldCheck size={40} className="text-teal-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Automatic License Verification</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">Every therapist on MindBridge goes through our automated credential verification system. We validate license numbers, issuing authorities, and document authenticity — no manual admin approval needed.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
