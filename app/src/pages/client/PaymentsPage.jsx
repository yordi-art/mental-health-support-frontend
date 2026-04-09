import { useState } from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw, Download, Receipt, X, Smartphone, Building2, CreditCard, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';

const methodIcon = { Telebirr: Smartphone, 'CBE Birr': Building2, 'Bank Transfer': Landmark, 'Card Payment': CreditCard };
const methodColor = { Telebirr: 'text-orange-500 bg-orange-50', 'CBE Birr': 'text-blue-600 bg-blue-50', 'Bank Transfer': 'text-teal-600 bg-teal-50', 'Card Payment': 'text-purple-600 bg-purple-50' };

const statusCfg = {
  paid: { icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50', badge: 'bg-green-100 text-green-700' },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-600' },
  refunded: { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  awaiting: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
};

const payments = [
  { id: 1, ref: 'MBR-20250410', therapist: 'Dr. Sarah Mengistu', specialization: 'Anxiety & Depression', avatar: 'https://i.pravatar.cc/150?img=47', date: '2025-04-10', time: '10:00 AM', amount: 800, status: 'pending', method: 'Telebirr' },
  { id: 2, ref: 'MBR-20250328', therapist: 'Dr. Yonas Bekele', specialization: 'Trauma & PTSD', avatar: 'https://i.pravatar.cc/150?img=12', date: '2025-03-28', time: '2:00 PM', amount: 950, status: 'paid', method: 'CBE Birr' },
  { id: 3, ref: 'MBR-20250310', therapist: 'Dr. Sarah Mengistu', specialization: 'Anxiety & Depression', avatar: 'https://i.pravatar.cc/150?img=47', date: '2025-03-10', time: '11:00 AM', amount: 800, status: 'paid', method: 'Telebirr' },
  { id: 4, ref: 'MBR-20250215', therapist: 'Dr. Hana Tadesse', specialization: 'Stress & Burnout', avatar: 'https://i.pravatar.cc/150?img=32', date: '2025-02-15', time: '3:00 PM', amount: 750, status: 'refunded', method: 'Bank Transfer' },
  { id: 5, ref: 'MBR-20250205', therapist: 'Dr. Kebede Alemu', specialization: 'Child & Adolescent', avatar: 'https://i.pravatar.cc/150?img=15', date: '2025-02-05', time: '9:00 AM', amount: 700, status: 'failed', method: 'Card Payment' },
];

function InvoiceModal({ p, onClose }) {
  const cfg = statusCfg[p.status];
  const MIcon = methodIcon[p.method] || CreditCard;
  const mColor = methodColor[p.method] || 'text-gray-500 bg-gray-50';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-400 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Receipt size={18} />
            <span className="font-bold">MindBridge Receipt</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition"><X size={18} /></button>
        </div>

        <div className="p-6">
          {/* Status */}
          <div className="text-center mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              <cfg.icon size={12} /> {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
            </span>
          </div>

          {/* Amount */}
          <div className="text-center mb-5 pb-5 border-b border-dashed border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
            <p className="text-4xl font-bold text-slate-800">ETB {p.amount}</p>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm mb-5">
            {[
              ['Receipt No.', p.ref],
              ['Client', 'Yordanos Tadesse'],
              ['Therapist', p.therapist],
              ['Session', 'Video Consultation'],
              ['Date', p.date],
              ['Time', p.time],
              ['Payment Date', p.date],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-slate-700 text-right max-w-[55%]">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Method</span>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${mColor}`}>
                <MIcon size={12} /> {p.method}
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Download size={15} /> Download PDF Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [invoice, setInvoice] = useState(null);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const filtered = payments.filter(p => filter === 'all' || p.status === filter);

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader title="Payments & Billing" description="Track your session payments and download receipts" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Paid', value: `ETB ${totalPaid.toLocaleString()}`, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Pending', value: `ETB ${pending.toLocaleString()}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Sessions', value: payments.filter(p => p.status === 'paid').length, color: 'text-primary', bg: 'bg-blue-50' },
          { label: 'Failed', value: payments.filter(p => p.status === 'failed').length, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + New Payment */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {['all', 'paid', 'pending', 'failed', 'refunded'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>
        <button onClick={() => navigate('/client/therapists')}
          className="text-xs bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition">
          + Book & Pay
        </button>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map(p => {
            const cfg = statusCfg[p.status];
            const MIcon = methodIcon[p.method] || CreditCard;
            const mColor = methodColor[p.method] || 'text-gray-500 bg-gray-50';
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                <img src={p.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.therapist}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{p.date} · {p.time}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium ${mColor}`}>
                      <MIcon size={10} /> {p.method}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-800">ETB {p.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${cfg.badge}`}>{p.status}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setInvoice(p)} title="View Receipt"
                    className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition">
                    <Receipt size={15} />
                  </button>
                  {p.status === 'failed' && (
                    <button onClick={() => navigate('/client/payment/checkout')} title="Retry"
                      className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition">
                      <RefreshCw size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {invoice && <InvoiceModal p={invoice} onClose={() => setInvoice(null)} />}
    </DashboardLayout>
  );
}
