import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, DollarSign, Clock, Video, Lock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import VerificationStatusBanner from '../../components/therapist/VerificationStatusBanner';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { therapistAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import useVerificationStatus from '../../hooks/useVerificationStatus';

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
  const { user } = useAuth();
  const name = user?.name || '';
  const { status, loading: vLoading, isVerified, isBlocked } = useVerificationStatus();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vLoading) {
      therapistAPI.getDashboard()
        .then(res => setDashboard(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [vLoading]);

  if (vLoading || loading) {
    return (
      <DashboardLayout sidebarItems={therapistSidebarItems} userName={name}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const appointments = dashboard?.todayAppointments || [];
  const clientRequests = dashboard?.clientRequests || [];
  const availability = dashboard?.availability || [];
  const earnings = dashboard?.earnings;
  const stats = dashboard?.stats || {};

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={name}>
      <VerificationStatusBanner status={status} notes={dashboard?.verificationNotes} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Total Appointments" value={isVerified ? (stats.totalAppointments ?? '—') : '—'} icon={Calendar} sub={isVerified ? `This month: ${stats.monthlyAppointments ?? 0}` : 'Locked'} color="text-primary" />
        <DashboardCard title="Active Clients" value={isVerified ? (stats.activeClients ?? '—') : '—'} icon={Users} sub={isVerified ? `${stats.newRequests ?? 0} new requests` : 'Locked'} color="text-teal-600" />
        <DashboardCard title="Average Rating" value={isVerified ? (stats.avgRating ? `${stats.avgRating}★` : '—') : '—'} icon={Star} sub={isVerified ? `${stats.reviewCount ?? 0} reviews` : 'Locked'} color="text-warning" />
        <DashboardCard title="Total Earnings" value={isVerified ? (stats.totalEarnings ? `ETB ${stats.totalEarnings.toLocaleString()}` : '—') : '—'} icon={DollarSign} sub={isVerified ? `This month: ${stats.monthlyEarnings ?? 0}` : 'Locked'} color="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                    <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {a.clientName?.[0] || 'C'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-700">{a.clientName}</p>
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

          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={16} className="text-primary" /> New Client Requests
              </h2>
              {clientRequests.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {clientRequests.map(r => (
                    <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                        {r.clientName?.[0] || 'C'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-700">{r.clientName}</p>
                        <p className="text-xs text-gray-500">{r.issue} · Requested {r.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => therapistAPI.respondToRequest(r._id, 'accept')}
                          className="text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 transition"
                        >Accept</button>
                        <button
                          onClick={() => therapistAPI.respondToRequest(r._id, 'decline')}
                          className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                        >Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BlockedOverlay>
        </div>

        <div className="space-y-5">
          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-primary" /> This Week's Availability
              </h2>
              {availability.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No schedule set.</p>
              ) : (
                <div className="space-y-2">
                  {availability.map(slot => (
                    <div key={slot.day} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 w-8">{slot.day}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${slot.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {slot.available ? `${slot.start} – ${slot.end}` : 'Off'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/therapist/availability" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">
                Manage Schedule
              </Link>
            </div>
          </BlockedOverlay>

          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-teal-500" /> Earnings Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>This Week</span><span className="font-medium">ETB {earnings?.weekly ?? 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>This Month</span><span className="font-medium">ETB {earnings?.monthly ?? 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>Total</span><span className="font-medium text-teal-600">ETB {earnings?.total ?? 0}</span></div>
              </div>
              <Link to="/therapist/earnings" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">View Details</Link>
            </div>
          </BlockedOverlay>

          <BlockedOverlay blocked={isBlocked}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Video size={16} className="text-primary" /> Next Session
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                {dashboard?.nextSession ? `${dashboard.nextSession.clientName} · ${dashboard.nextSession.time}` : 'No upcoming sessions scheduled.'}
              </p>
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
