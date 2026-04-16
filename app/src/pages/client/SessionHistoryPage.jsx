import { useState, useEffect } from 'react';
import { Calendar, Video, Clock, Download } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function SessionHistoryPage() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientAPI.getAppointments()
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : [];
        setCompleted(all.filter(a => a.status === 'completed'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = completed.reduce((s, a) => s + (a.fee || a.amount || 0), 0);
  const uniqueTherapists = new Set(completed.map(a => a.therapistId?._id || a.therapistId)).size;

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <PageHeader title="Session History" description="A record of all your completed therapy sessions" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sessions', value: completed.length, color: 'text-primary bg-blue-50' },
          { label: 'Total Spent', value: `ETB ${totalSpent.toLocaleString()}`, color: 'text-teal-600 bg-teal-50' },
          { label: 'Therapists Seen', value: uniqueTherapists, color: 'text-purple-600 bg-purple-50' },
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : completed.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No completed sessions yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {completed.map(a => {
              const therapistName = a.therapistId?.userId?.name || 'Therapist';
              return (
                <div key={a._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video size={18} className="text-teal-600" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {therapistName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-700">{therapistName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar size={10} />{a.date}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{a.time}</span>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                  <span className="font-semibold text-sm text-slate-700">ETB {a.fee || a.amount || 0}</span>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition" title="Download summary">
                    <Download size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
