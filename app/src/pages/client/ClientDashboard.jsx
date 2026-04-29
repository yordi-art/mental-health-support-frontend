import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, Brain, CheckCircle, TrendingUp, Bell } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import TherapistCard from '../../components/common/TherapistCard';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI, notificationAPI, publicAPI } from '../../api';  // publicAPI kept for fallback
import { useAuth } from '../../context/AuthContext';

const moods = [
  { label: '😊 Good', value: 'good', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: '😐 Okay', value: 'okay', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: '😰 Stressed', value: 'stressed', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: '😔 Low', value: 'low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const name = user?.name || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [dashboard, setDashboard] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clientAPI.getDashboard(),
      notificationAPI.getAll(),
    ]).then(([dash, notif]) => {
      const data = dash.data;
      const upcoming = data.upcomingAppointments?.[0] || data.upcomingAppointment || null;
      const latestRaw = data.recentAssessments?.[0] || data.latestAssessment || null;
      setDashboard({
        upcomingAppointment: upcoming ? {
          ...upcoming,
          therapistName: upcoming.therapistId?.userId?.name || 'Therapist',
        } : null,
        latestAssessment: latestRaw ? {
          type: latestRaw.type || latestRaw.assessmentType || '—',
          score: latestRaw.score ?? latestRaw.totalScore ?? '—',
          category: latestRaw.category || latestRaw.resultCategory || latestRaw.severity || '—',
          recommendation: latestRaw.recommendation || '',
          date: latestRaw.date || (latestRaw.createdAt ? new Date(latestRaw.createdAt).toLocaleDateString() : ''),
        } : null,
        billing: data.billing || null,
      });
      setNotifications(notif.data?.notifications || notif.data || []);

      // ── AI therapist recommendations based on latest assessment ──
      clientAPI.getRecommendations()
        .then(recRes => {
          const recommended = recRes.data?.recommendedTherapists || [];
          setTherapists(recommended.slice(0, 2));
        })
        .catch(() => {
          // AI service down — fall back to plain verified list
          publicAPI.getTherapists({ limit: 2 })
            .then(th => setTherapists(th.data?.therapists || th.data || []))
            .catch(() => {});
        });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const upcoming = dashboard?.upcomingAppointment;
  const latestResult = dashboard?.latestAssessment;
  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={name}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );
  }

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={name}>
      {/* Welcome Hero */}
      <div className="bg-brand-gradient rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-bold mb-1">{name}</h1>
        <p className="text-blue-100 text-sm mb-4">How are you feeling today? Your wellness journey continues here.</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/client/assessment" className="bg-white text-primary text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition">Take Assessment</Link>
          <Link to="/client/therapists" className="bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition">Find Therapist</Link>
          <Link to="/client/appointments" className="bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition">Book Session</Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Latest Assessment" value={latestResult?.type || '—'} icon={ClipboardList} sub={latestResult?.date || 'None taken'} color="text-primary" />
        <DashboardCard title="Upcoming Session" value={upcoming ? upcoming.date : 'None'} icon={Calendar} sub={upcoming?.time} color="text-teal-600" />
        <DashboardCard title="Wellness Score" value={latestResult?.category || '—'} icon={TrendingUp} sub={latestResult ? `Score: ${latestResult.score}` : 'No data'} color="text-yellow-500" />
        <DashboardCard title="Notifications" value={unread} icon={Bell} sub={`${unread} unread`} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Check */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Brain size={17} className="text-primary" /> How are you feeling today?</h2>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button key={m.value} className={`px-4 py-2 rounded-xl border text-sm font-medium transition hover:scale-105 ${m.color}`}>{m.label}</button>
              ))}
            </div>
          </div>

          {/* Latest Assessment Result */}
          {latestResult && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={17} className="text-primary" /> Latest Assessment Result</h2>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex flex-col items-center justify-center border border-yellow-100">
                  <span className="text-2xl font-bold text-yellow-600">{latestResult.score}</span>
                  <span className="text-xs text-yellow-500">/ 27</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">{latestResult.type} — {latestResult.category}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{latestResult.recommendation}</p>
                  <p className="text-xs text-gray-400 mt-1">Taken on {latestResult.date}</p>
                </div>
              </div>
              <Link to="/client/therapists" className="inline-block text-xs bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition">Find a Therapist →</Link>
            </div>
          )}

          {/* Recommended Therapists */}
          {therapists.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle size={17} className="text-teal-500" /> Recommended Therapists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {therapists.slice(0, 2).map(t => <TherapistCard key={t._id} t={t} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Upcoming Appointment */}
          {upcoming && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Upcoming Session</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {upcoming.therapistName?.[0] || 'T'}
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-700">{upcoming.therapistName}</p>
                  <p className="text-xs text-gray-500">{upcoming.date} · {upcoming.time}</p>
                </div>
              </div>
              <StatusBadge status="upcoming" />
              <div className="flex gap-2 mt-3">
                <Link to="/client/session" className="flex-1 text-center text-xs bg-primary text-white rounded-lg py-2 hover:bg-blue-600 transition">Join Session</Link>
                <button className="flex-1 text-xs border border-gray-200 text-gray-500 rounded-lg py-2 hover:bg-gray-50 transition">Reschedule</button>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Bell size={16} className="text-primary" /> Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map(n => (
                  <div key={n._id} className={`flex gap-2 p-2 rounded-xl ${!n.isRead ? 'bg-blue-50' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-gray-300'}`} />
                    <div>
                      <p className="text-xs text-slate-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing Summary */}
          {dashboard?.billing && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-teal-500" /> Billing Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Last Payment</span><span className="font-medium">ETB {dashboard.billing.lastPayment || 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>Sessions This Month</span><span className="font-medium">{dashboard.billing.sessionsThisMonth || 0}</span></div>
                <div className="flex justify-between text-gray-600"><span>Total Spent</span><span className="font-medium text-primary">ETB {dashboard.billing.totalSpent || 0}</span></div>
              </div>
              <Link to="/client/payments" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">View All Payments</Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
