import { Users, UserCheck, Calendar, DollarSign, AlertTriangle, Flag, Eye, ShieldOff, RefreshCw, Megaphone, Send } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminStats, verificationQueue } from '../../data/sampleData';
import { notificationAPI } from '../../api';
import { useState } from 'react';

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announceSending, setAnnounceSending] = useState(false);
  const [announceMsg, setAnnounceMsg] = useState('');

  const sendAnnouncement = async () => {
    if (!announcement.trim()) return;
    setAnnounceSending(true);
    try {
      await notificationAPI.sendAnnouncement({ userIds: [], message: announcement });
      setAnnounceMsg('Announcement sent!');
      setAnnouncement('');
    } catch {
      setAnnounceMsg('Failed to send.');
    } finally {
      setAnnounceSending(false);
      setTimeout(() => setAnnounceMsg(''), 3000);
    }
  };

  const filtered = verificationQueue.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.profession.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor platform activity and system verification results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <DashboardCard title="Total Users" value={adminStats.totalUsers.toLocaleString()} icon={Users} color="text-primary" />
        <DashboardCard title="Therapists" value={adminStats.totalTherapists} icon={UserCheck} color="text-teal-600" />
        <DashboardCard title="Appointments" value={adminStats.totalAppointments.toLocaleString()} icon={Calendar} color="text-blue-500" />
        <DashboardCard title="Revenue" value={`ETB ${(adminStats.totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} color="text-green-500" />
        <DashboardCard title="Flagged" value={adminStats.flaggedVerifications} icon={AlertTriangle} color="text-orange-500" />
        <DashboardCard title="Open Issues" value={adminStats.pendingIssues} icon={Flag} color="text-red-400" />
      </div>

      {/* Verification Monitoring */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Verification Monitoring</h2>
            <p className="text-xs text-gray-500 mt-0.5">System-processed license verifications — admin monitors only</p>
          </div>
          <div className="w-56">
            <SearchBar placeholder="Search therapist..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Therapist', 'Profession', 'Status', 'Confidence', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 pr-4 font-medium text-slate-700">{v.name}</td>
                  <td className="py-3 pr-4 text-gray-500 capitalize">{v.profession}</td>
                  <td className="py-3 pr-4"><StatusBadge status={v.status} /></td>
                  <td className="py-3 pr-4">
                    {v.confidence !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.confidence >= 80 ? 'bg-teal-500' : v.confidence >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${v.confidence}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{v.confidence}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">Processing...</span>}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{v.submitted}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button title="View" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                      <button title="Flag" className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition"><AlertTriangle size={14} /></button>
                      <button title="Suspend" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><ShieldOff size={14} /></button>
                      <button title="Request Re-upload" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"><RefreshCw size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Announcement Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Megaphone size={16} className="text-warning" /> Send Announcement</h2>
        <div className="flex gap-3">
          <input
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            placeholder="Type a system-wide announcement..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendAnnouncement}
            disabled={announceSending || !announcement.trim()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
          >
            <Send size={14} /> {announceSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {announceMsg && <p className="text-xs text-success mt-2">{announceMsg}</p>}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-slate-800 mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {[
              { name: 'Yordanos T.', role: 'client', date: '2025-04-06', avatar: 'https://i.pravatar.cc/150?img=5' },
              { name: 'Dr. Abebe G.', role: 'therapist', date: '2025-04-05', avatar: 'https://i.pravatar.cc/150?img=12' },
              { name: 'Selam H.', role: 'client', date: '2025-04-04', avatar: 'https://i.pravatar.cc/150?img=9' },
            ].map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={u.avatar} alt="" className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.date}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.role === 'therapist' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-slate-800 mb-4">Open Reports / Issues</h2>
          <div className="space-y-3">
            {[
              { title: 'Session not started on time', user: 'Biruk M.', severity: 'medium', date: '2025-04-06' },
              { title: 'Payment not reflected', user: 'Hana T.', severity: 'high', date: '2025-04-05' },
              { title: 'Therapist unresponsive', user: 'Dawit A.', severity: 'high', date: '2025-04-04' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
                <Flag size={14} className={`mt-0.5 flex-shrink-0 ${r.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.user} · {r.date}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{r.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
