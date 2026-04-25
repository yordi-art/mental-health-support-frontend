import { useState, useEffect } from 'react';
import { Calendar, Clock, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminAPI } from '../../api';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAppointments()
      .then(res => setAppointments(res.data?.appointments || res.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter(a =>
    (filter === 'all' || a.status === filter) &&
    (a.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
     a.therapistId?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
     a.client?.toLowerCase().includes(search.toLowerCase()) ||
     a.therapist?.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = { total: appointments.length, upcoming: appointments.filter(a => a.status === 'upcoming' || a.status === 'confirmed').length, completed: appointments.filter(a => a.status === 'completed').length };

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Appointments Monitor" description="Monitor all platform sessions and bookings" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-primary bg-blue-50' },
          { label: 'Upcoming', value: counts.upcoming, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Completed', value: counts.completed, color: 'text-teal-600 bg-teal-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[1]}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Client', 'Therapist', 'Date & Time', 'Status', 'Fee'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No appointments found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a._id || a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-700">{a.clientId?.name || a.client || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.therapistId?.userId?.name || a.therapist || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1"><Calendar size={11} />{a.date?.slice(0, 10)}</span>
                    <span className="flex items-center gap-1 mt-0.5"><Clock size={11} />{a.time}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 font-medium text-slate-700">{a.fee ? `ETB ${a.fee}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
