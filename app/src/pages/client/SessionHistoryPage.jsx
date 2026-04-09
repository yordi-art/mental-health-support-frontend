import { Calendar, Video, Clock, Download } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { appointments } from '../../data/sampleData';

export default function SessionHistoryPage() {
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader title="Session History" description="A record of all your completed therapy sessions" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sessions', value: completed.length, color: 'text-primary bg-blue-50' },
          { label: 'Total Spent', value: `ETB ${completed.reduce((s, a) => s + a.fee, 0).toLocaleString()}`, color: 'text-teal-600 bg-teal-50' },
          { label: 'Therapists Seen', value: new Set(completed.map(a => a.therapistId)).size, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[1]}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-slate-800">Completed Sessions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {completed.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video size={18} className="text-teal-600" />
              </div>
              <img src={a.avatar} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-700">{a.therapist}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={10} />{a.date}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{a.time}</span>
                </div>
              </div>
              <StatusBadge status={a.status} />
              <span className="font-semibold text-sm text-slate-700">ETB {a.fee}</span>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition" title="Download summary">
                <Download size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
