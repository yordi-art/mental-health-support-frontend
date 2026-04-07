import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Users, Star, DollarSign, CheckCircle, Clock, Video } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { appointments } from '../../data/sampleData';

const verificationStatus = 'verified'; // Change to test: pending, flagged, failed

const verificationConfig = {
  verified: { color: 'bg-teal-50 border-teal-200', icon: CheckCircle, iconColor: 'text-teal-500', title: 'License Verified', desc: 'Your professional license has been successfully verified by our system. You are fully active on the platform.' },
  pending: { color: 'bg-yellow-50 border-yellow-200', icon: Clock, iconColor: 'text-yellow-500', title: 'Verification Pending', desc: 'Your license is being processed by our system. This usually takes a few minutes.' },
  flagged: { color: 'bg-orange-50 border-orange-200', icon: ShieldCheck, iconColor: 'text-orange-500', title: 'Verification Flagged', desc: 'Your submission has been flagged. Our team will review and contact you within 24 hours.' },
  failed: { color: 'bg-red-50 border-red-200', icon: ShieldCheck, iconColor: 'text-red-500', title: 'Verification Failed', desc: 'We could not verify your license. Please re-upload your credentials.' },
};

const clientRequests = [
  { id: 1, name: 'Yordanos T.', issue: 'Anxiety & Stress', date: '2025-04-08', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Biruk M.', issue: 'Depression', date: '2025-04-09', avatar: 'https://i.pravatar.cc/150?img=8' },
];

export default function TherapistDashboard() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const name = user.name || 'Dr. Sarah';
  const vc = verificationConfig[verificationStatus];

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={name}>
      {/* Verification Status Card */}
      <div className={`rounded-2xl border p-5 mb-6 flex items-start gap-4 ${vc.color}`}>
        <vc.icon size={28} className={vc.iconColor} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-slate-800">{vc.title}</h2>
            <StatusBadge status={verificationStatus} />
          </div>
          <p className="text-sm text-gray-600">{vc.desc}</p>
        </div>
        {verificationStatus !== 'verified' && (
          <Link to="/therapist/register" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition flex-shrink-0">Re-upload</Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Total Appointments" value="48" icon={Calendar} sub="This month: 12" color="text-primary" />
        <DashboardCard title="Active Clients" value="23" icon={Users} sub="2 new requests" color="text-teal-600" />
        <DashboardCard title="Average Rating" value="4.9★" icon={Star} sub="128 reviews" color="text-yellow-500" />
        <DashboardCard title="Total Earnings" value="ETB 38,400" icon={DollarSign} sub="This month: 9,600" color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Today's Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <img src={a.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-700">{a.therapist}</p>
                      <p className="text-xs text-gray-500">{a.date} · {a.time} · {a.type}</p>
                    </div>
                    <StatusBadge status={a.status} />
                    {a.status === 'upcoming' && (
                      <Link to="/therapist/sessions" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">Join</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Requests */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Users size={16} className="text-primary" /> New Client Requests</h2>
            <div className="space-y-3">
              {clientRequests.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <img src={r.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-700">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.issue} · Requested {r.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 transition">Accept</button>
                    <button className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Availability */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Clock size={16} className="text-primary" /> This Week's Availability</h2>
            <div className="space-y-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                <div key={d} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 w-8">{d}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${i % 3 === 0 ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'}`}>
                    {i % 3 === 0 ? 'Off' : '9:00 AM – 5:00 PM'}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/therapist/availability" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">Manage Schedule</Link>
          </div>

          {/* Earnings Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><DollarSign size={16} className="text-teal-500" /> Earnings Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>This Week</span><span className="font-medium">ETB 2,400</span></div>
              <div className="flex justify-between text-gray-600"><span>This Month</span><span className="font-medium">ETB 9,600</span></div>
              <div className="flex justify-between text-gray-600"><span>Total</span><span className="font-medium text-teal-600">ETB 38,400</span></div>
            </div>
            <Link to="/therapist/earnings" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">View Details</Link>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Recent Reviews</h2>
            <div className="space-y-3">
              {[{ name: 'Yordanos T.', text: 'Very helpful and understanding.', rating: 5 }, { name: 'Selam G.', text: 'Great session, felt much better.', rating: 5 }].map((r, i) => (
                <div key={i} className="border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-slate-700">{r.name}</span>
                    <span className="text-xs text-yellow-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
