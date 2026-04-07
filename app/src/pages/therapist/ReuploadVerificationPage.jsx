import { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function ReuploadVerificationPage() {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ licenseNumber: '', authority: '', issueDate: '', expiryDate: '' });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const f = field => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Re-submission Received</h2>
          <p className="text-gray-500 text-sm mb-6">Our system is re-processing your credentials. You'll be notified once verification is complete.</p>
          <button onClick={() => navigate('/therapist/verification')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
            View Verification Status
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Re-upload Credentials</h1>
        <p className="text-sm text-gray-500 mb-6">Submit updated license documents for system re-verification.</p>

        {/* Previous Issue */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-700">Previous Issue</p>
            <p className="text-xs text-orange-600 mt-0.5">Issuing authority could not be confirmed. License number format mismatch detected. Please re-upload a clear, valid document.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 block mb-1">License Number</label><input {...f('licenseNumber')} placeholder="ETH-PSY-2024-XXXX" className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Issuing Authority</label><input {...f('authority')} placeholder="Ethiopian Health Authority" className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Issue Date</label><input type="date" {...f('issueDate')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Expiry Date</label><input type="date" {...f('expiryDate')} className={inputCls} /></div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Upload New License Document</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload PDF or image'}</span>
              <span className="text-xs text-gray-400 mt-1">Max 5MB · PDF, JPG, PNG</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>

          <button disabled={!file} onClick={() => setSubmitted(true)}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Resubmit for System Verification
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
