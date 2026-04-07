import { Video, Star, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { appointments } from '../../data/sampleData';

export default function SessionHistoryPage() {
  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader title="Session History" description="Your past and upcoming therapy sessions" />
      <div className="space-y-3">
        {appointments.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <img src={a.avatar} alt={a.therapist} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-slate-700">{a.therapist}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.date} · {a.time} · {a.type}</p>
            </div>
            <StatusBadge status={a.status} />
            <div className="flex gap-2">
              {a.status === 'upcoming' && (
                <Link to="/client/session" className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">
                  <Video size={12} /> Join
                </Link>
              )}
              {a.status === 'completed' && (
                <>
                  <Link to={`/client/reviews/new/${a.therapistId}`} className="flex items-center gap-1 text-xs border border-yellow-300 text-yellow-600 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition">
                    <Star size={12} /> Review
                  </Link>
                  <button className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                    <FileText size={12} /> Notes
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
