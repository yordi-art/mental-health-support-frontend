import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, Brain, CheckCircle, TrendingUp, Bell } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import TherapistCard from '../../components/common/TherapistCard';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists, appointments, assessmentResults, notifications } from '../../data/sampleData';

const moods = [
  { label: '😊 Good', value: 'good', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: '😐 Okay', value: 'okay', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: '😰 Stressed', value: 'stressed', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: '😔 Low', value: 'low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

export default function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const name = user.name || 'Yordanos';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const upcoming = appointments.find(a => a.status === 'upcoming');
  const latestResult = assessmentResults[0];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={name}>
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-primary to-blue-400 rounded-2xl p-6 text-white mb-6">
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
        <DashboardCard title="Latest Assessment" value={latestResult.type} icon={ClipboardList} sub={latestResult.date} color="text-primary" />
        <DashboardCard title="Upcoming Session" value={upcoming ? upcoming.date : 'None'} icon={Calendar} sub={upcoming?.time} color="text-teal-600" />
        <DashboardCard title="Wellness Score" value="Mild" icon={TrendingUp} sub="PHQ-9: 7 / GAD-7: 5" color="text-yellow-500" />
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

          {/* Assessment Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={17} className="text-primary" /> Mental Health Assessments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'PHQ-9', desc: 'Depression screening', lastDone: '2025-03-20', score: 7, category: 'Mild' },
                { name: 'GAD-7', desc: 'Anxiety screening', lastDone: '2025-03-20', score: 5, category: 'Mild' },
              ].map(a => (
                <div key={a.name} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">{a.name}</span>
                    <StatusBadge status="completed" />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{a.desc}</p>
                  <p className="text-xs text-gray-400">Last: {a.lastDone} · Score: {a.score} ({a.category})</p>
                  <Link to="/client/assessment" className="mt-3 block text-center text-xs bg-primary text-white rounded-lg py-1.5 hover:bg-blue-600 transition">Retake</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Result */}
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

          {/* Recommended Therapists */}
          <div>
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle size={17} className="text-teal-500" /> Recommended Therapists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {therapists.slice(0, 2).map(t => <TherapistCard key={t.id} t={t} />)}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Upcoming Appointment */}
          {upcoming && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Upcoming Session</h2>
              <div className="flex items-center gap-3 mb-3">
                <img src={therapists[0].avatar} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium text-sm text-slate-700">{upcoming.therapist}</p>
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
            <div className="space-y-3">
              {notifications.slice(0, 3).map(n => (
                <div key={n.id} className={`flex gap-2 p-2 rounded-xl ${!n.read ? 'bg-blue-50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-xs text-slate-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-teal-500" /> Billing Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Last Payment</span><span className="font-medium">ETB 800</span></div>
              <div className="flex justify-between text-gray-600"><span>Sessions This Month</span><span className="font-medium">2</span></div>
              <div className="flex justify-between text-gray-600"><span>Total Spent</span><span className="font-medium text-primary">ETB 1,600</span></div>
            </div>
            <Link to="/client/payments" className="mt-3 block text-center text-xs border border-gray-200 text-gray-500 rounded-xl py-2 hover:bg-gray-50 transition">View All Payments</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
