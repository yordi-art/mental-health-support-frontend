import { useState } from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw, Download, Search, Smartphone, Building2, Landmark, CreditCard, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';

const methodIcon = { Telebirr: Smartphone, 'CBE Birr': Building2, 'Bank Transfer': Landmark, 'Card Payment': CreditCard };
const methodColor = { Telebirr: 'text-orange-500 bg-orange-50', 'CBE Birr': 'text-blue-600 bg-blue-50', 'Bank Transfer': 'text-teal-600 bg-teal-50', 'Card Payment': 'text-purple-600 bg-purple-50' };

const statusCfg = {
  paid: { icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50', badge: 'bg-green-100 text-green-700' },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-600' },
  refunded: { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  awaiting: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
};

const allPayments = [
  { id: 1, ref: 'MBR-20250410', client: 'Yordanos T.', therapist: 'Dr. Sarah Mengistu', date: '2025-04-10', amount: 800, status: 'pending', method: 'Telebirr' },
  { id: 2, ref: 'MBR-20250328', client: 'Biruk M.', therapist: 'Dr. Yonas Bekele', date: '2025-03-28', amount: 950, status: 'paid', method: 'CBE Birr' },
  { id: 3, ref: 'MBR-20250310', client: 'Selam G.', therapist: 'Dr. Sarah Mengistu', date: '2025-03-10', amount: 800, status: 'paid', method: 'Telebirr' },
  { id: 4, ref: 'MBR-20250305', client: 'Hana T.', therapist: 'Dr. Hana Tadesse', date: '2025-03-05', amount: 750, status: 'paid', method: 'Bank Transfer' },
  { id: 5, ref: 'MBR-20250205', client: 'Dawit A.', therapist: 'Dr. Kebede Alemu', date: '2025-02-05', amount: 700, status: 'failed', method: 'Card Payment' },
  { id: 6, ref: 'MBR-20250215', client: 'Meron K.', therapist: 'Dr. Yonas Bekele', date: '2025-02-15', amount: 950, status: 'refunded', method: 'CBE Birr' },
  { id: 7, ref: 'MBR-20250412', client: 'Abel T.', therapist: 'Dr. Hana Tadesse', date: '2025-04-12', amount: 750, status: 'awaiting', method: 'Bank Transfer' },
];

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const totalRevenue = allPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const filtered = allPayments.filter(p =>
    (filter === 'all' || p.status === filter) &&
    (p.client.toLowerCase().includes(search.toLowerCase()) ||
     p.therapist.toLowerCase().includes(search.toLowerCase()) ||
     p.ref.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, color: 'text-teal-600 bg-teal-50', count: null },
    { label: 'Successful', value: allPayments.filter(p => p.status === 'paid').length, color: 'text-green-600 bg-green-50', count: true },
    { label: 'Pending', value: allPayments.filter(p => p.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50', count: true },
    { label: 'Failed', value: allPayments.filter(p => p.status === 'failed').length, color: 'text-red-500 bg-red-50', count: true },
  ];

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Payments Monitor" description="Monitor all platform transactions — read only" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[1]}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary" />
          <h2 className="font-semibold text-slate-800 text-sm">Revenue by Method</h2>
        </div>
        <div className="space-y-2">
          {['Telebirr', 'CBE Birr', 'Bank Transfer', 'Card Payment'].map(m => {
            const amt = allPayments.filter(p => p.method === m && p.status === 'paid').reduce((s, p) => s + p.amount, 0);
            const pct = totalRevenue > 0 ? (amt / totalRevenue) * 100 : 0;
            const MIcon = methodIcon[m];
            const mColor = methodColor[m];
            return (
              <div key={m} className="flex items-center gap-3 text-sm">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mColor}`}><MIcon size={13} /></div>
                <span className="w-24 text-gray-600 text-xs">{m}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">ETB {amt.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, therapist, ref..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'paid', 'pending', 'failed', 'refunded', 'awaiting'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition ml-auto"><Download size={14} /> Export</button>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Reference', 'Client', 'Therapist', 'Date', 'Method', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cfg = statusCfg[p.status] || statusCfg.pending;
                const MIcon = methodIcon[p.method] || CreditCard;
                const mColor = methodColor[p.method] || 'text-gray-500 bg-gray-50';
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.ref}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{p.client}</td>
                    <td className="px-4 py-3 text-gray-600">{p.therapist}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{p.date}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium w-fit ${mColor}`}>
                        <MIcon size={11} /> {p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">ETB {p.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${cfg.badge}`}>{p.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
