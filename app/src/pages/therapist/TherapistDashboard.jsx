import { Link } from 'react-router-dom';
import { Calendar, Users, Star, DollarSign, Clock, Video, Lock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import VerificationStatusBanner from '../../components/therapist/VerificationStatusBanner';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { appointments } from '../../data/sampleData';
import useVerificationStatus from '../../hooks/useVerificationStatus';

const clientRequests = [
  { id: 1, name: 'Yordanos T.', issue: 'Anxiety & Stress', date: '2025-04-08', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Biruk M.', issue: 'Depression', date: '2025-04-09', avatar: 'https://i.pravatar.cc/150?img=8' },
];

// Wrapper that shows a lock overlay for blocked actions
function BlockedOverlay({ blocked, children }) {
  if (!blocked) return children;
  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <Lock size={16} /> Available after verification
        </div>
      </div>
    </div>
  );
}

export default function TherapistDashboard() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const name = user.name || 'Dr. Sarah';
  const { status, notes, loading, isVerified, isBlocked } = useVerificationStatus();

  if (loading) {
    return (
      <DashboardLayout sidebarItems={therapistSidebarItems} userName={name}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={name}>
      {/* Verification Status Banner — always visible */}
      <VerificationStatusBanner status={status} notes={notes} />

      {/* Stats — visible to all, but values locked if not verified */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Total Appointments" value={isVerified ? '48' : '—'} icon={Calendar} sub={isVerified ? 'This month: 12' : 'Locked'} color="text-primary" />
        <DashboardCard title="Active Clients" value={isVerified ? '23' : '—'} icon={Users} sub={isVerified ? '2 new requests' : 'Locked'} color="text-teal-600" />
        <DashboardCard title="Average Rating" value={isVerified ? '4.9★' : '—'} icon={Star} sub={isVerified ? '128 reviews' : 'Locked'} color="text-warning" />
        <DashboardCard title="Total Earnings" value={isVerified ? 'ETB 38,400' : '—'} icon={DollarSign} sub={isVerified ? 'This month: 9,600' : 'Locked'} color="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Appointments — blocked if not verified */}
          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Today's Appointments
              </h2>
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
          </BlockedOverlay>

          {/* Client Requests — blocked if not verified */}
          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={16} className="text-primary" /> New Client Requests
              </h2>
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
          </BlockedOverlay>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Availability — blocked if not verified */}
          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-primary" /> This Week's Availability
              </h2>
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
              <Link to="/therapist/availability" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">
                Manage Schedule
              </Link>
            </div>
          </BlockedOverlay>

          {/* Earnings — blocked if not verified */}
          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-teal-500" /> Earnings Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>This Week</span><span className="font-medium">ETB 2,400</span></div>
                <div className="flex justify-between text-gray-600"><span>This Month</span><span className="font-medium">ETB 9,600</span></div>
                <div className="flex justify-between text-gray-600"><span>Total</span><span className="font-medium text-teal-600">ETB 38,400</span></div>
              </div>
              <Link to="/therapist/earnings" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">View Details</Link>
            </div>
          </BlockedOverlay>

          {/* Video Session — blocked if not verified */}
          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Video size={16} className="text-primary" /> Next Session
              </h2>
              <p className="text-sm text-gray-500 mb-3">No upcoming sessions scheduled.</p>
              <Link to="/therapist/sessions" className="block text-center text-xs bg-primary text-white rounded-xl py-2 hover:bg-blue-600 transition">
                View Sessions
              </Link>
            </div>
          </BlockedOverlay>
        </div>
      </div>
    </DashboardLayout>
  );
}
