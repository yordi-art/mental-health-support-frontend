import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw, Download, Search, Smartphone, Building2, Landmark, CreditCard, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminAPI } from '../../api';

const methodIcon = { Telebirr: Smartphone, 'CBE Birr': Building2, 'Bank Transfer': Landmark, 'Card Payment': CreditCard };
const methodColor = { Telebirr: 'text-orange-500 bg-orange-50', 'CBE Birr': 'text-blue-600 bg-blue-50', 'Bank Transfer': 'text-teal-600 bg-teal-50', 'Card Payment': 'text-purple-600 bg-purple-50' };
const statusCfg = {
  paid:     { badge: 'bg-green-100 text-green-700' },
  pending:  { badge: 'bg-yellow-100 text-yellow-700' },
  failed:   { badge: 'bg-red-100 text-red-600' },
  refunded: { badge: 'bg-purple-100 text-purple-700' },
  awaiting: { badge: 'bg-blue-100 text-blue-700' },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getPayments()
      .then(res => setPayments(res.data?.payments || res.data || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);

  const filtered = payments.filter(p =>
    (filter === 'all' || p.status === filter) &&
    (p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
     p.ref?.toLowerCase().includes(search.toLowerCase()) ||
     p.client?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, color: 'text-teal-600 bg-teal-50' },
    { label: 'Successful', value: payments.filter(p => p.status === 'paid').length, color: 'text-green-600 bg-green-50' },
    { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Failed', value: payments.filter(p => p.status === 'failed').length, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Payments Monitor" description="Monitor all platform transactions — read only" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[1]}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary" />
          <h2 className="font-semibold text-slate-800 text-sm">Revenue by Method</h2>
        </div>
        <div className="space-y-2">
          {['Telebirr', 'CBE Birr', 'Bank Transfer', 'Card Payment'].map(m => {
            const amt = payments.filter(p => p.method === m && p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
            const pct = totalRevenue > 0 ? (amt / totalRevenue) * 100 : 0;
            const MIcon = methodIcon[m];
            return (
              <div key={m} className="flex items-center gap-3 text-sm">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${methodColor[m]}`}><MIcon size={13} /></div>
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

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Reference', 'Client', 'Date', 'Method', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">No payments found.</td></tr>
              ) : filtered.map(p => {
                const cfg = statusCfg[p.status] || statusCfg.pending;
                const MIcon = methodIcon[p.method] || CreditCard;
                const mColor = methodColor[p.method] || 'text-gray-500 bg-gray-50';
                return (
                  <tr key={p._id || p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.ref || p._id?.slice(-8)}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{p.userId?.name || p.client || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{p.createdAt?.slice(0, 10) || p.date}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium w-fit ${mColor}`}>
                        <MIcon size={11} /> {p.method || '—'}
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
