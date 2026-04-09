import { CreditCard, CheckCircle, Clock, XCircle, Download, Search } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';

const allPayments = [
  { id: 1, client: 'Yordanos T.', therapist: 'Dr. Sarah Mengistu', date: '2025-04-10', amount: 800, status: 'pending', method: 'Telebirr' },
  { id: 2, client: 'Biruk M.', therapist: 'Dr. Yonas Bekele', date: '2025-03-28', amount: 950, status: 'paid', method: 'CBE Birr' },
  { id: 3, client: 'Selam G.', therapist: 'Dr. Sarah Mengistu', date: '2025-03-10', amount: 800, status: 'paid', method: 'Telebirr' },
  { id: 4, client: 'Hana T.', therapist: 'Dr. Hana Tadesse', date: '2025-04-05', amount: 750, status: 'paid', method: 'Bank Transfer' },
  { id: 5, client: 'Dawit A.', therapist: 'Dr. Kebede Alemu', date: '2025-03-05', amount: 700, status: 'failed', method: 'Telebirr' },
];

const statusIcon = { paid: CheckCircle, pending: Clock, failed: XCircle };
const statusColor = { paid: 'text-teal-500', pending: 'text-yellow-500', failed: 'text-red-500' };
const statusBg = { paid: 'bg-teal-50', pending: 'bg-yellow-50', failed: 'bg-red-50' };

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const totalRevenue = allPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const filtered = allPayments.filter(p =>
    p.client.toLowerCase().includes(search.toLowerCase()) ||
    p.therapist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Payments Monitor" description="Track all platform transactions and revenue" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, color: 'text-teal-600 bg-teal-50' },
          { label: 'Pending', value: allPayments.filter(p => p.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Failed', value: allPayments.filter(p => p.status === 'failed').length, color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[1]}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="relative max-w-xs flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition ml-3"><Download size={14} /> Export</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map(p => {
            const Icon = statusIcon[p.status];
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                <div className={`w-10 h-10 rounded-xl ${statusBg[p.status]} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={statusColor[p.status]} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{p.client} → {p.therapist}</p>
                  <p className="text-xs text-gray-400">{p.date} · {p.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">ETB {p.amount}</p>
                  <span className={`text-xs capitalize ${statusColor[p.status]}`}>{p.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
