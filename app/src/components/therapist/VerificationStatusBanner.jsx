import { CheckCircle, Clock, XCircle, AlertTriangle, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  VERIFIED: {
    icon: CheckCircle,
    bg: 'bg-success/10 border-success/30',
    iconColor: 'text-success',
    badge: 'bg-success/15 text-success',
    title: 'License Verified',
    message: 'Your professional license has been verified. You have full access to the platform.',
    canReupload: false,
    blocked: false,
  },
  PENDING: {
    icon: Clock,
    bg: 'bg-warning/10 border-warning/30',
    iconColor: 'text-warning',
    badge: 'bg-warning/15 text-warning',
    title: 'Verification Pending',
    message: 'Your account is under verification. The system is processing your credentials. This usually takes a few minutes.',
    canReupload: false,
    blocked: true,
  },
  REJECTED: {
    icon: XCircle,
    bg: 'bg-error/10 border-error/30',
    iconColor: 'text-error',
    badge: 'bg-error/15 text-error',
    title: 'Verification Failed',
    message: 'Your verification failed. Please review the issues and re-upload your documents to continue.',
    canReupload: true,
    blocked: true,
  },
  EXPIRED: {
    icon: AlertTriangle,
    bg: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-500',
    badge: 'bg-orange-100 text-orange-600',
    title: 'License Expired',
    message: 'Your license has expired. Please renew your license and re-upload your documents to restore access.',
    canReupload: true,
    blocked: true,
  },
};

export default function VerificationStatusBanner({ status = 'PENDING', notes }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border p-5 mb-6 flex items-start gap-4 ${cfg.bg}`}>
      <Icon size={26} className={`flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h2 className="font-semibold text-slate-800">{cfg.title}</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{status}</span>
        </div>
        <p className="text-sm text-gray-600">{cfg.message}</p>
        {notes && (
          <p className="text-xs text-gray-500 mt-1.5 bg-white/60 rounded-lg px-3 py-1.5 border border-white/80">
            System note: {notes}
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {cfg.canReupload && (
          <Link
            to="/therapist/reupload"
            className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-2 rounded-xl hover:bg-blue-600 active:scale-95 transition font-medium"
          >
            <Upload size={13} /> Re-upload
          </Link>
        )}
        <Link
          to="/therapist/verification"
          className="text-xs border border-gray-200 text-gray-500 px-3 py-2 rounded-xl hover:bg-white transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

// Lightweight inline badge only (for use in tables/cards)
export function VerificationBadge({ status }) {
  const colors = {
    VERIFIED: 'bg-success/15 text-success',
    PENDING:  'bg-warning/15 text-warning',
    REJECTED: 'bg-error/15 text-error',
    EXPIRED:  'bg-orange-100 text-orange-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}
