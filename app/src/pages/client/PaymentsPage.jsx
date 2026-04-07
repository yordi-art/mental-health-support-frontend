import { CreditCard, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { payments } from '../../data/sampleData';

const statusIcon = { paid: CheckCircle, pending: Clock, failed: XCircle };
const statusColor = { paid: 'text-teal-500', pending: 'text-yellow-500', failed: 'text-red-500' };
const statusBg = { paid: 'bg-teal-50', pending: 'bg-yellow-50', failed: 'bg-red-50' };

const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

export default function PaymentsPage() {
  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader title="Payments & Billing" description="Track your session payments and billing history" />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Paid', value: `ETB ${total.toLocaleString()}`, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Pending', value: `ETB ${payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Sessions Paid', value: payments.filter(p => p.status === 'paid').length, color: 'text-primary', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-slate-800">Billing History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.map(p => {
            const Icon = statusIcon[p.status];
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                <div className={`w-10 h-10 rounded-xl ${statusBg[p.status]} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={statusColor[p.status]} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{p.therapist}</p>
                  <p className="text-xs text-gray-400">{p.date} · {p.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">ETB {p.amount}</p>
                  <span className={`text-xs capitalize ${statusColor[p.status]}`}>{p.status}</span>
                </div>
                {p.status === 'paid' && (
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition" title="Download receipt">
                    <Download size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
