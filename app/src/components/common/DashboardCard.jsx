export default function DashboardCard({ title, value, icon: Icon, color = 'text-primary', sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
      <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-slate-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
