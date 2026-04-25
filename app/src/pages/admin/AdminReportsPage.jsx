import { useState, useEffect } from 'react';
import { Flag, Eye, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminAPI } from '../../api';

const severityColor = { high: 'bg-red-100 text-red-600', medium: 'bg-yellow-100 text-yellow-600', low: 'bg-gray-100 text-gray-500' };
const statusColor = { open: 'bg-orange-100 text-orange-600', investigating: 'bg-blue-100 text-blue-600', resolved: 'bg-green-100 text-green-600' };
const typeColor = { session: 'text-primary', payment: 'text-teal-600', abuse: 'text-red-500' };

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReports()
      .then(res => setReports(res.data?.reports || res.data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.title?.toLowerCase().includes(search.toLowerCase()) ||
     r.user?.toLowerCase().includes(search.toLowerCase()))
  );

  const resolve = async (id) => {
    try {
      await adminAPI.updateReportStatus(id, 'resolved');
      setReports(reports.map(r => (r._id || r.id) === id ? { ...r, status: 'resolved' } : r));
    } catch {}
  };

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Reports & Issues" description="Monitor and resolve platform complaints and flagged activity" />

      <div className="flex gap-3 mb-5">
        <div className="flex-1 max-w-xs"><SearchBar placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="flex gap-2">
          {['all', 'open', 'investigating', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">No reports found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const id = r._id || r.id;
            return (
              <div key={id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                  <Flag size={16} className={typeColor[r.type] || 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium text-slate-700">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Reported by {r.user} · {r.date || r.createdAt?.slice(0, 10)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.severity && <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${severityColor[r.severity] || 'bg-gray-100 text-gray-500'}`}>{r.severity}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[r.status] || 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" title="View"><Eye size={15} /></button>
                  {r.status !== 'resolved' && (
                    <button onClick={() => resolve(id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition" title="Mark resolved">
                      <CheckCircle size={15} />
                    </button>
                  )}
                  {r.status === 'open' && (
                    <button className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500 transition" title="Mark investigating">
                      <Clock size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
