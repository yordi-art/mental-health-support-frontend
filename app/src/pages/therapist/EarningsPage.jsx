import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const transactions = [
  { id: 1, client: 'Yordanos T.', date: '2025-04-10', amount: 800, status: 'paid' },
  { id: 2, client: 'Biruk M.', date: '2025-04-08', amount: 800, status: 'paid' },
  { id: 3, client: 'Selam G.', date: '2025-03-28', amount: 800, status: 'paid' },
  { id: 4, client: 'Hana T.', date: '2025-03-15', amount: 800, status: 'paid' },
  { id: 5, client: 'Dawit A.', date: '2025-03-10', amount: 800, status: 'paid' },
];

export default function EarningsPage() {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const thisMonth = transactions.filter(t => t.date.startsWith('2025-04')).reduce((s, t) => s + t.amount, 0);

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Earnings" description="Track your session income and payment history" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Earnings', value: `ETB ${total.toLocaleString()}`, icon: DollarSign, color: 'text-teal-600 bg-teal-50' },
          { label: 'This Month', value: `ETB ${thisMonth.toLocaleString()}`, icon: Calendar, color: 'text-primary bg-blue-50' },
          { label: 'Sessions Paid', value: transactions.length, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 flex items-center gap-4 ${s.color.split(' ')[1]}`}>
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${s.color.split(' ')[0]}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Payment History</h2>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition"><Download size={14} /> Export</button>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign size={16} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Session with {t.client}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
              <span className="font-semibold text-slate-800">ETB {t.amount}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
