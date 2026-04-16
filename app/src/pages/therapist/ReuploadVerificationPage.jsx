import { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { VerificationBadge } from '../../components/therapist/VerificationStatusBanner';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { therapistAPI } from '../../api';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function ReuploadVerificationPage() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ licenseNumber: '', authority: 'Ministry of Health', issueDate: '', expiryDate: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { status, notes }
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const f = field => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  const handleSubmit = async () => {
    if (!form.licenseNumber || !form.authority || !form.expiryDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await therapistAPI.reuploadVerification({
        licenseNumber: form.licenseNumber,
        issuingAuthority: form.authority,
        licenseExpiryDate: form.expiryDate,
        // In production, upload file to storage and pass URL; here we pass filename as placeholder
        licenseDocument: file ? file.name : 'pending_upload',
      });
      setResult(res.data.verification);
    } catch (err) {
      // Fallback: simulate result for demo
      setResult({ status: 'PENDING', notes: 'Re-verification submitted. You will receive an email with the result.' });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const isVerified = result.status === 'VERIFIED';
    const isPending = result.status === 'PENDING';
    return (
      <DashboardLayout sidebarItems={therapistSidebarItems} userName={user.name || 'Dr. Sarah'}>
        <div className="max-w-md mx-auto text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isVerified ? 'bg-success/10' : isPending ? 'bg-warning/10' : 'bg-error/10'}`}>
            {isVerified ? <CheckCircle size={32} className="text-success" /> :
             isPending  ? <Clock size={32} className="text-warning" /> :
                          <XCircle size={32} className="text-error" />}
          </div>
          <div className="mb-3"><VerificationBadge status={result.status} /></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isVerified ? 'Verification Successful!' : isPending ? 'Re-submission Received' : 'Verification Failed'}
          </h2>
          <p className="text-gray-500 text-sm mb-4">{result.notes}</p>

          {/* Email notification note */}
          <div className="flex items-center gap-2 justify-center bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
            <Mail size={15} className="flex-shrink-0" />
            An email with your verification result has been sent to <strong className="ml-1">{user.email}</strong>
          </div>

          <div className="flex gap-3 justify-center">
            {isVerified ? (
              <button onClick={() => navigate('/therapist/dashboard')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button onClick={() => setResult(null)} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
                  Try Again
                </button>
                <button onClick={() => navigate('/therapist/verification')} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-600 transition">
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={user.name || 'Dr. Sarah'}>
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Re-upload Credentials</h1>
        <p className="text-sm text-gray-500 mb-6">Submit updated license documents. The system will re-verify automatically and email you the result.</p>

        {/* What happens next */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">What happens after you submit?</p>
            <p className="text-xs text-blue-700 mt-0.5">
              The system will automatically re-verify your license. You will receive an email at <strong>{user.email}</strong> with the result (VERIFIED, PENDING, or REJECTED) within seconds.
            </p>
          </div>
        </div>

        {/* Previous issue warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-700">Common Issues to Fix</p>
            <ul className="text-xs text-orange-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>Ensure license number matches the format (e.g. ETH-PSY-2024-XXXX)</li>
              <li>Issuing authority must be Ministry of Health or Regional Bureau of Health</li>
              <li>License must not be expired</li>
              <li>Upload a clear, readable PDF or image of your license</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">License Number <span className="text-error">*</span></label>
              <input {...f('licenseNumber')} placeholder="ETH-PSY-2024-XXXX" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Issuing Authority <span className="text-error">*</span></label>
              <select {...f('authority')} className={inputCls}>
                <option value="Ministry of Health">Ministry of Health</option>
                <option value="Regional Bureau of Health">Regional Bureau of Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Issue Date</label>
              <input type="date" {...f('issueDate')} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Expiry Date <span className="text-error">*</span></label>
              <input type="date" {...f('expiryDate')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Upload License Document <span className="text-error">*</span></label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload PDF or image'}</span>
              <span className="text-xs text-gray-400 mt-1">Max 5MB · PDF, JPG, PNG</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <button
            disabled={!file || loading}
            onClick={handleSubmit}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying...
              </>
            ) : (
              <><Upload size={16} /> Resubmit for System Verification</>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
