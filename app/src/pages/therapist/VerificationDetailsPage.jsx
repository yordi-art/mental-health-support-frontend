import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, AlertTriangle, Upload, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import VerificationStatusBanner, { VerificationBadge } from '../../components/therapist/VerificationStatusBanner';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { therapistAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function VerificationDetailsPage() {
  const { user, refetchVerification } = useAuth();
  const [verification, setVerification] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      therapistAPI.getVerificationStatus(),
      therapistAPI.getProfile(),
    ])
      .then(([vRes, pRes]) => {
        setVerification(vRes.data.verification);
        setProfile(pRes.data.therapist);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={therapistSidebarItems} userName={user.name || 'Dr. Sarah'}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const status = verification?.status || 'PENDING';
  const canReupload = status === 'REJECTED' || status === 'EXPIRED';

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={user.name || 'Dr. Sarah'}>
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Verification Details</h1>
        <p className="text-sm text-gray-500 mb-6">System verification result for your professional license</p>

        {/* Status Banner */}
        <VerificationStatusBanner status={status} notes={verification?.notes} />

        {/* How verification works */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <ShieldCheck size={16} /> How Verification Works
          </h2>
          <ol className="space-y-2">
            {[
              { step: '1', text: 'You submit your license details and upload your document.' },
              { step: '2', text: 'The system automatically checks: license validity, expiry date, issuing authority, education field, and competency (COC/exam).' },
              { step: '3', text: 'A result is returned instantly — VERIFIED, PENDING, REJECTED, or EXPIRED.' },
              { step: '4', text: 'You receive an email notification with the result and next steps.' },
              { step: '5', text: 'If rejected or expired, click "Re-upload" to fix and resubmit. The system re-verifies automatically.' },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3 text-sm text-blue-800">
                <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{step}</span>
                {text}
              </li>
            ))}
          </ol>
        </div>

        {/* License Details */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-primary" /> License Information
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'License Number', value: profile.license?.licenseNumber || '—' },
                { label: 'Issuing Authority', value: profile.license?.issuingAuthority || '—' },
                { label: 'Expiry Date', value: profile.license?.licenseExpiryDate ? new Date(profile.license.licenseExpiryDate).toLocaleDateString() : '—' },
                { label: 'Education Field', value: profile.education?.field || '—' },
                { label: 'COC / Exam', value: profile.competency?.hasCOC || profile.competency?.examPassed ? 'Passed ✓' : 'Not submitted' },
                { label: 'Document', value: profile.license?.licenseDocument ? 'Uploaded ✓' : 'Not uploaded' },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                  <p className="font-medium text-slate-700 text-sm">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Notes */}
        {verification?.notes && (
          <div className={`rounded-2xl p-5 mb-5 border ${status === 'REJECTED' || status === 'EXPIRED' ? 'bg-error/5 border-error/20' : 'bg-white border-gray-100'}`}>
            <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className={status === 'REJECTED' ? 'text-error' : 'text-warning'} />
              System Verification Notes
            </h2>
            <p className="text-sm text-gray-600">{verification.notes}</p>
            {verification.verifiedAt && (
              <p className="text-xs text-gray-400 mt-2">Processed: {new Date(verification.verifiedAt).toLocaleString()}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canReupload && (
            <Link
              to="/therapist/reupload"
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 active:scale-95 transition"
            >
              <Upload size={16} /> Re-upload Documents
            </Link>
          )}
          {status === 'PENDING' && (
            <button
              onClick={async () => { await refetchVerification(); window.location.reload(); }}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-3 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              <RefreshCw size={15} /> Refresh Status
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
