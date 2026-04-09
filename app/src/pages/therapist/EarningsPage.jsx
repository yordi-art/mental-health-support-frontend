import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Clock, Download, Smartphone, Building2, Landmark, CreditCard } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const methodIcon = { Telebirr: Smartphone, 'CBE Birr': Building2, 'Bank Transfer': Landmark, 'Card Payment': CreditCard };
const methodColor = { Telebirr: 'text-orange-500 bg-orange-50', 'CBE Birr': 'text-blue-600 bg-blue-50', 'Bank Transfer': 'text-teal-600 bg-teal-50', 'Card Payment': 'text-purple-600 bg-purple-50' };

const transactions = [
  { id: 1, client: 'Yordanos T.', avatar: 'https://i.pravatar.cc/150?img=5', date: '2025-04-10', amount: 800, status: 'paid', method: 'Telebirr' },
  { id: 2, client: 'Biruk M.', avatar: 'https://i.pravatar.cc/150?img=8', date: '2025-04-08', amount: 800, status: 'paid', method: 'CBE Birr' },
  { id: 3, client: 'Selam G.', avatar: 'https://i.pravatar.cc/150?img=9', date: '2025-03-28', amount: 800, status: 'paid', method: 'Telebirr' },
  { id: 4, client: 'Hana T.', avatar: 'https://i.pravatar.cc/150?img=32', date: '2025-03-15', amount: 800, status: 'paid', method: 'Bank Transfer' },
  { id: 5, client: 'Dawit A.', avatar: 'https://i.pravatar.cc/150?img=15', date: '2025-03-10', amount: 800, status: 'pending', method: 'Telebirr' },
  { id: 6, client: 'Meron K.', avatar: 'https://i.pravatar.cc/150?img=20', date: '2025-02-28', amount: 800, status: 'paid', method: 'Card Payment' },
];

const statusBadge = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-600',
};

export default function EarningsPage() {
  const [filter, setFilter] = useState('all');

  const paid = transactions.filter(t => t.status === 'paid');
  const pending = transactions.filter(t => t.status === 'pending');
  const total = paid.reduce((s, t) => s + t.amount, 0);
  const thisMonth = paid.filter(t => t.date.startsWith('2025-04')).reduce((s, t) => s + t.amount, 0);
  const pendingAmt = pending.reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t => filter === 'all' || t.status === filter);

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Earnings" description="Track your session income and payment history" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Earnings', value: `ETB ${total.toLocaleString()}`, icon: DollarSign, color: 'text-teal-600 bg-teal-50' },
          { label: 'This Month', value: `ETB ${thisMonth.toLocaleString()}`, icon: Calendar, color: 'text-primary bg-blue-50' },
          { label: 'Pending', value: `ETB ${pendingAmt.toLocaleString()}`, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Sessions Paid', value: paid.length, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-3 ${s.color.split(' ')[1]}`}>
            <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 ${s.color.split(' ')[0]}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-lg font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly bar summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4 text-sm">Monthly Earnings</h2>
        <div className="flex items-end gap-2 h-20">
          {[{ m: 'Jan', v: 3200 }, { m: 'Feb', v: 4000 }, { m: 'Mar', v: 3200 }, { m: 'Apr', v: 1600 }].map(d => (
            <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">ETB {(d.v / 1000).toFixed(1)}K</span>
              <div className="w-full bg-primary rounded-t-lg" style={{ height: `${(d.v / 4000) * 56}px` }} />
              <span className="text-xs text-gray-400">{d.m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'paid', 'pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'}`}>{f}</button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition"><Download size={14} /> Export</button>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(t => {
            const MIcon = methodIcon[t.method] || CreditCard;
            const mColor = methodColor[t.method] || 'text-gray-500 bg-gray-50';
            return (
              <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                <img src={t.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Session with {t.client}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{t.date}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium ${mColor}`}>
                      <MIcon size={10} /> {t.method}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-800">ETB {t.amount}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge[t.status]}`}>{t.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
