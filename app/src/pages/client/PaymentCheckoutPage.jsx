import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, CheckCircle, Smartphone, Building2, CreditCard, Landmark } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists } from '../../data/sampleData';

const paymentMethods = [
  { id: 'telebirr', label: 'Telebirr', desc: 'Fast mobile payment', icon: Smartphone, color: 'text-orange-500 bg-orange-50' },
  { id: 'cbe', label: 'CBE Birr', desc: 'Secure bank wallet payment', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  { id: 'bank', label: 'Bank Transfer', desc: 'Direct bank payment', icon: Landmark, color: 'text-teal-600 bg-teal-50' },
  { id: 'card', label: 'Card Payment', desc: 'Debit / Credit card', icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
];

export default function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};
  const t = therapists.find(th => th.id === Number(params.therapistId)) || therapists[0];
  const date = params.date || '2025-04-14';
  const time = params.time || '10:00 AM';

  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!method) return;
    setLoading(true);
    setTimeout(() => {
      // Simulate: 85% success, 15% fail
      const success = Math.random() > 0.15;
      navigate(success ? '/client/payment/success' : '/client/payment/failed', {
        state: { therapist: t, date, time, method, amount: t.price, ref: `MBR-${Date.now().toString().slice(-8)}` }
      });
    }, 1800);
  };

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Complete Your Payment</h1>
        <p className="text-sm text-gray-500 mb-6">Review your session details and choose a payment method</p>

        {/* Session Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide text-gray-400">Session Summary</h2>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
            <div>
              <p className="font-semibold text-slate-800">{t.name}</p>
              <p className="text-xs text-gray-500">{t.specialization}</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle size={11} className="text-teal-500" />
                <span className="text-xs text-teal-600 font-medium">System Verified</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Session Type', 'Video Consultation'],
              ['Date', new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
              ['Time', time],
              ['Duration', '50 minutes'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-slate-700">{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-gray-100 mt-2">
              <span className="font-semibold text-slate-800">Consultation Fee</span>
              <span className="font-bold text-xl text-primary">ETB {t.price}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${method === m.id ? 'border-primary bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                  <m.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                {method === m.id && <CheckCircle size={16} className="text-primary ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific instructions */}
        {method === 'telebirr' && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5 text-sm">
            <p className="font-medium text-orange-700 mb-1">Telebirr Instructions</p>
            <p className="text-orange-600 text-xs">Send ETB {t.price} to <strong>+251 911 000 000</strong> (MindBridge). Use your appointment reference as the reason.</p>
          </div>
        )}
        {method === 'cbe' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 text-sm">
            <p className="font-medium text-blue-700 mb-1">CBE Birr Instructions</p>
            <p className="text-blue-600 text-xs">Transfer ETB {t.price} to CBE Birr account <strong>1000123456789</strong> (MindBridge Health). Include your name as reference.</p>
          </div>
        )}
        {method === 'bank' && (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-5 text-sm">
            <p className="font-medium text-teal-700 mb-1">Bank Transfer Details</p>
            <div className="text-teal-600 text-xs space-y-0.5">
              <p>Bank: <strong>Commercial Bank of Ethiopia</strong></p>
              <p>Account: <strong>1000 1234 5678 9</strong></p>
              <p>Name: <strong>MindBridge Health PLC</strong></p>
              <p>Amount: <strong>ETB {t.price}</strong></p>
            </div>
          </div>
        )}
        {method === 'card' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 space-y-3">
            <p className="font-medium text-slate-800 text-sm">Card Details</p>
            <input placeholder="Card Number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="MM / YY" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input placeholder="CVV" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <input placeholder="Cardholder Name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <ShieldCheck size={14} className="text-teal-500" />
          Your payment is secure and encrypted. MindBridge never stores your payment credentials.
        </div>

        <button onClick={handlePay} disabled={!method || loading}
          className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-base hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : `Pay ETB ${t.price}`}
        </button>
      </div>
    </DashboardLayout>
  );
}
