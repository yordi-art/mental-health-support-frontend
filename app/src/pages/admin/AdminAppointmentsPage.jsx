import { Calendar, Clock, Video, Search } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { adminSidebarItems } from '../../components/admin/adminNav';

const allAppointments = [
  { id: 1, client: 'Yordanos T.', therapist: 'Dr. Sarah Mengistu', date: '2025-04-10', time: '10:00 AM', status: 'upcoming', fee: 800 },
  { id: 2, client: 'Biruk M.', therapist: 'Dr. Yonas Bekele', date: '2025-03-28', time: '2:00 PM', status: 'completed', fee: 950 },
  { id: 3, client: 'Selam G.', therapist: 'Dr. Sarah Mengistu', date: '2025-03-10', time: '11:00 AM', status: 'completed', fee: 800 },
  { id: 4, client: 'Hana T.', therapist: 'Dr. Hana Tadesse', date: '2025-04-12', time: '3:00 PM', status: 'upcoming', fee: 750 },
  { id: 5, client: 'Dawit A.', therapist: 'Dr. Kebede Alemu', date: '2025-03-05', time: '9:00 AM', status: 'cancelled', fee: 700 },
];

export default function AdminAppointmentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = allAppointments.filter(a =>
    (filter === 'all' || a.status === filter) &&
    (a.client.toLowerCase().includes(search.toLowerCase()) || a.therapist.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Appointments Monitor" description="Monitor all platform sessions and bookings" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: allAppointments.length, color: 'text-primary bg-blue-50' },
          { label: 'Upcoming', value: allAppointments.filter(a => a.status === 'upcoming').length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Completed', value: allAppointments.filter(a => a.status === 'completed').length, color: 'text-teal-600 bg-teal-50' },
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
          {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
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
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-700">{a.client}</td>
                  <td className="px-4 py-3 text-gray-600">{a.therapist}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                    <span className="flex items-center gap-1 mt-0.5"><Clock size={11} />{a.time}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 font-medium text-slate-700">ETB {a.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
