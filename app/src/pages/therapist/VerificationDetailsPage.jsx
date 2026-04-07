import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Clock, Upload, FileText } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

// Change this to test different states: verified | pending | flagged | failed | reupload_required
const mockStatus = 'flagged';

const configs = {
  verified: { icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200', title: 'License Verified', canReupload: false },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'Verification Pending', canReupload: false },
  flagged: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', title: 'Verification Flagged', canReupload: true },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', title: 'Verification Failed', canReupload: true },
  reupload_required: { icon: Upload, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', title: 'Re-upload Required', canReupload: true },
};

const mockData = {
  licenseNumber: 'ETH-PSY-2024-0041',
  authority: 'Ethiopian Health Authority',
  issueDate: '2022-03-15',
  expiryDate: '2027-03-15',
  submittedDate: '2025-04-05',
  confidence: 42,
  flagReason: 'Issuing authority could not be confirmed. License number format mismatch detected.',
  systemNotes: 'Document scan quality was acceptable. Identity match: partial. Authority validation: failed.',
};

export default function VerificationDetailsPage() {
  const cfg = configs[mockStatus];
  const Icon = cfg.icon;

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Verification Details</h1>
        <p className="text-sm text-gray-500 mb-6">System verification result for your professional license</p>

        {/* Status Banner */}
        <div className={`rounded-2xl border p-5 mb-5 flex items-start gap-4 ${cfg.bg} ${cfg.border}`}>
          <Icon size={28} className={cfg.color} />
          <div className="flex-1">
            <h2 className={`font-bold text-lg ${cfg.color}`}>{cfg.title}</h2>
            <p className="text-sm text-gray-600 mt-0.5">Submitted on {mockData.submittedDate}</p>
            {mockData.confidence !== null && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">System confidence:</span>
                <div className="w-24 h-1.5 bg-white rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${mockData.confidence >= 80 ? 'bg-teal-500' : mockData.confidence >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${mockData.confidence}%` }} />
                </div>
                <span className={`text-xs font-medium ${cfg.color}`}>{mockData.confidence}%</span>
              </div>
            )}
          </div>
          {cfg.canReupload && (
            <Link to="/therapist/reupload" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition flex-shrink-0">
              Re-upload
            </Link>
          )}
        </div>

        {/* License Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><FileText size={16} className="text-primary" /> License Information</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'License Number', value: mockData.licenseNumber },
              { label: 'Issuing Authority', value: mockData.authority },
              { label: 'Issue Date', value: mockData.issueDate },
              { label: 'Expiry Date', value: mockData.expiryDate },
            ].map(row => (
              <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                <p className="font-medium text-slate-700">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flag Reason */}
        {mockData.flagReason && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-orange-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Issue Detected</h2>
            <p className="text-sm text-orange-700">{mockData.flagReason}</p>
          </div>
        )}

        {/* System Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
          <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> System Verification Notes</h2>
          <p className="text-sm text-gray-600">{mockData.systemNotes}</p>
        </div>

        {cfg.canReupload && (
          <Link to="/therapist/reupload" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition">
            <Upload size={16} /> Re-upload Credentials
          </Link>
        )}
      </div>
    </DashboardLayout>
  );
}
