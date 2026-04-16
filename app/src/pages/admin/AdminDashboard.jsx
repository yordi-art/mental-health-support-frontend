import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, DollarSign, AlertTriangle, Flag, Eye, ShieldOff, RefreshCw, Megaphone, Send } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminAPI, notificationAPI } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [search, setSearch] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announceSending, setAnnounceSending] = useState(false);
  const [announceMsg, setAnnounceMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getVerifications()])
      .then(([dash, verif]) => {
        setStats(dash.data?.stats || dash.data);
        setVerifications(verif.data?.verifications || verif.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const filtered = verifications.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.profession?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor platform activity and system verification results</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <DashboardCard title="Total Users" value={stats?.totalUsers?.toLocaleString() ?? '—'} icon={Users} color="text-primary" />
        <DashboardCard title="Therapists" value={stats?.totalTherapists ?? '—'} icon={UserCheck} color="text-teal-600" />
        <DashboardCard title="Appointments" value={stats?.totalAppointments?.toLocaleString() ?? '—'} icon={Calendar} color="text-blue-500" />
        <DashboardCard title="Revenue" value={stats?.totalRevenue ? `ETB ${(stats.totalRevenue / 1000).toFixed(0)}K` : '—'} icon={DollarSign} color="text-green-500" />
        <DashboardCard title="Flagged" value={stats?.flaggedVerifications ?? '—'} icon={AlertTriangle} color="text-orange-500" />
        <DashboardCard title="Open Issues" value={stats?.pendingIssues ?? '—'} icon={Flag} color="text-red-400" />
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
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">No verifications found.</td></tr>
              ) : filtered.map(v => (
                <tr key={v._id || v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 pr-4 font-medium text-slate-700">{v.name}</td>
                  <td className="py-3 pr-4 text-gray-500 capitalize">{v.profession}</td>
                  <td className="py-3 pr-4"><StatusBadge status={v.status} /></td>
                  <td className="py-3 pr-4">
                    {v.confidence != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.confidence >= 80 ? 'bg-teal-500' : v.confidence >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${v.confidence}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{v.confidence}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">Processing...</span>}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{v.submitted || v.createdAt}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button title="View" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                      <button title="Flag" onClick={() => adminAPI.flagVerification(v._id || v.id, 'Manual flag')} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition"><AlertTriangle size={14} /></button>
                      <button title="Suspend" onClick={() => adminAPI.suspendTherapist(v._id || v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><ShieldOff size={14} /></button>
                      <button title="Request Re-upload" onClick={() => adminAPI.requestReupload(v._id || v.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"><RefreshCw size={14} /></button>
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
            value={announcement} onChange={e => setAnnouncement(e.target.value)}
            placeholder="Type a system-wide announcement..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendAnnouncement} disabled={announceSending || !announcement.trim()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
          >
            <Send size={14} /> {announceSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {announceMsg && <p className="text-xs text-success mt-2">{announceMsg}</p>}
      </div>

      {/* Recent Registrations from API */}
      {stats?.recentUsers?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-slate-800 mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((u, i) => (
              <div key={u._id || i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {u.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.createdAt}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.role === 'therapist' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
