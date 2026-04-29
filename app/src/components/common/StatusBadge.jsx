const badges = {
  verified:          { dot: 'bg-teal-500',   pill: 'bg-teal-50 text-teal-700 border-teal-100' },
  VERIFIED:          { dot: 'bg-teal-500',   pill: 'bg-teal-50 text-teal-700 border-teal-100' },
  pending:           { dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-700 border-amber-100' },
  PENDING:           { dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-700 border-amber-100' },
  processing:        { dot: 'bg-blue-400',   pill: 'bg-blue-50 text-blue-700 border-blue-100' },
  failed:            { dot: 'bg-red-500',    pill: 'bg-red-50 text-red-700 border-red-100' },
  REJECTED:          { dot: 'bg-red-500',    pill: 'bg-red-50 text-red-700 border-red-100' },
  rejected:          { dot: 'bg-red-500',    pill: 'bg-red-50 text-red-700 border-red-100' },
  flagged:           { dot: 'bg-orange-400', pill: 'bg-orange-50 text-orange-700 border-orange-100' },
  expired:           { dot: 'bg-gray-400',   pill: 'bg-gray-100 text-gray-600 border-gray-200' },
  EXPIRED:           { dot: 'bg-gray-400',   pill: 'bg-gray-100 text-gray-600 border-gray-200' },
  reupload_required: { dot: 'bg-purple-400', pill: 'bg-purple-50 text-purple-700 border-purple-100' },
  upcoming:          { dot: 'bg-blue-400',   pill: 'bg-blue-50 text-blue-700 border-blue-100' },
  confirmed:         { dot: 'bg-teal-500',   pill: 'bg-teal-50 text-teal-700 border-teal-100' },
  completed:         { dot: 'bg-emerald-500',pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  cancelled:         { dot: 'bg-red-400',    pill: 'bg-red-50 text-red-600 border-red-100' },
};

export default function StatusBadge({ status }) {
  const s = String(status || '');
  const cfg = badges[s] || { dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600 border-gray-200' };
  const label = s.replace(/_/g, ' ').toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {label}
    </span>
  );
}
