import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, CreditCard, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';

export default function PaymentFailedPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const s = state || {};
  const t = s.therapist || { name: 'Dr. Sarah Mengistu', price: 800 };

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-md mx-auto">
        {/* Failed Banner */}
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Failed</h1>
          <p className="text-gray-500 text-sm">We couldn't process your payment. No amount was charged.</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-3 text-sm">What may have gone wrong?</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            {[
              'Insufficient balance in your account',
              'Network or connection issue during payment',
              'Payment session timed out',
              'Card details entered incorrectly',
            ].map(r => (
              <li key={r} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Session info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-400">Therapist</span><span className="font-medium text-slate-700">{t.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-medium text-slate-700">ETB {t.price}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Failed</span></div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={() => navigate('/client/payment/checkout', { state: s })}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition">
            <RefreshCw size={16} /> Retry Payment
          </button>
          <button onClick={() => navigate('/client/payment/checkout', { state: { ...s, method: null } })}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
            <CreditCard size={16} /> Try Another Method
          </button>
          <button onClick={() => navigate('/client/appointments')}
            className="w-full flex items-center justify-center gap-2 text-gray-400 py-2 text-sm hover:text-gray-600 transition">
            <ArrowLeft size={14} /> Back to Appointments
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
