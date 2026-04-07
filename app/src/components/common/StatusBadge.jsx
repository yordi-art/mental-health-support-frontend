const badges = {
  verified: 'bg-teal-100 text-teal-700',
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  flagged: 'bg-orange-100 text-orange-700',
  expired: 'bg-gray-100 text-gray-600',
  reupload_required: 'bg-purple-100 text-purple-700',
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function StatusBadge({ status }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badges[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}
