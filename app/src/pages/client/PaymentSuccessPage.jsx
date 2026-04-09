import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Calendar, Video, Receipt } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';

export default function PaymentSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const s = state || {};
  const t = s.therapist || { name: 'Dr. Sarah Mengistu', specialization: 'Anxiety & Depression', avatar: 'https://i.pravatar.cc/150?img=47', price: 800 };
  const ref = s.ref || 'MBR-12345678';
  const methodLabel = { telebirr: 'Telebirr', cbe: 'CBE Birr', bank: 'Bank Transfer', card: 'Card Payment' }[s.method] || 'Telebirr';

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-lg mx-auto">
        {/* Success Banner */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 rounded-3xl p-8 text-center mb-6">
          <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Payment Successful!</h1>
          <p className="text-gray-500 text-sm">Your session has been confirmed. See you soon!</p>
          <div className="mt-3 inline-block bg-white px-4 py-1.5 rounded-full text-xs font-mono text-gray-500 border border-gray-100">
            Ref: {ref}
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="bg-primary px-5 py-4 flex items-center gap-2">
            <Receipt size={16} className="text-white" />
            <span className="text-white font-semibold text-sm">Payment Receipt</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-slate-800">{t.name}</p>
                <p className="text-xs text-gray-500">{t.specialization}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Receipt No.', ref],
                ['Client', 'Yordanos Tadesse'],
                ['Session Type', 'Video Consultation'],
                ['Date', s.date || '2025-04-14'],
                ['Time', s.time || '10:00 AM'],
                ['Payment Method', methodLabel],
                ['Payment Date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-slate-700">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-100 mt-1">
                <span className="font-bold text-slate-800">Amount Paid</span>
                <span className="font-bold text-xl text-teal-600">ETB {t.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">Paid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Download size={15} /> Download Receipt
          </button>
          <button onClick={() => navigate('/client/appointments')}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
            <Calendar size={15} /> View Appointments
          </button>
        </div>

        <button onClick={() => navigate('/client/session')}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-teal-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition">
          <Video size={15} /> Join Session When Ready
        </button>
      </div>
    </DashboardLayout>
  );
}
