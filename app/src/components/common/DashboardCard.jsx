const colorMap = {
  'text-primary':   'bg-blue-50',
  'text-teal-600':  'bg-teal-50',
  'text-teal-500':  'bg-teal-50',
  'text-yellow-500':'bg-yellow-50',
  'text-warning':   'bg-amber-50',
  'text-success':   'bg-emerald-50',
  'text-green-500': 'bg-emerald-50',
  'text-red-400':   'bg-red-50',
  'text-orange-500':'bg-orange-50',
  'text-blue-500':  'bg-blue-50',
};

export default function DashboardCard({ title, value, icon: Icon, color = 'text-primary', sub }) {
  const bg = colorMap[color] || 'bg-gray-50';
  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5 flex items-center gap-4 border border-gray-100">
      <div className={`p-3 rounded-xl flex-shrink-0 ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}
