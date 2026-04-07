import { useState } from 'react';
import { Flag, Eye, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminReports } from '../../data/sampleData';

const severityColor = { high: 'bg-red-100 text-red-600', medium: 'bg-yellow-100 text-yellow-600', low: 'bg-gray-100 text-gray-500' };
const statusColor = { open: 'bg-orange-100 text-orange-600', investigating: 'bg-blue-100 text-blue-600', resolved: 'bg-green-100 text-green-600' };
const typeColor = { session: 'text-primary', payment: 'text-teal-600', abuse: 'text-red-500' };

export default function AdminReportsPage() {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(adminReports);

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.user.toLowerCase().includes(search.toLowerCase())
  );

  const resolve = (id) => setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Reports & Issues" description="Monitor and resolve platform complaints and flagged activity" />

      <div className="flex gap-3 mb-5">
        <div className="flex-1 max-w-xs"><SearchBar placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="flex gap-2">
          {['all', 'open', 'investigating', 'resolved'].map(s => (
            <button key={s} className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 capitalize transition">{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${severityColor[r.severity].replace('text-', 'bg-').replace('-600', '-50').replace('-500', '-50')}`}>
              <Flag size={16} className={typeColor[r.type]} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-medium text-slate-700">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Reported by {r.user} · {r.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${severityColor[r.severity]}`}>{r.severity}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[r.status]}`}>{r.status}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" title="View"><Eye size={15} /></button>
              {r.status !== 'resolved' && (
                <button onClick={() => resolve(r.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition" title="Mark resolved">
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
        ))}
      </div>
    </DashboardLayout>
  );
}
