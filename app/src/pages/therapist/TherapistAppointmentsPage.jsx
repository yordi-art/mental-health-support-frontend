import { Calendar, Clock, Video, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { appointments } from '../../data/sampleData';

const allAppointments = [
  ...appointments,
  { id: 4, therapist: 'Biruk M.', therapistId: 3, avatar: 'https://i.pravatar.cc/150?img=8', date: '2025-04-12', time: '11:00 AM', type: 'Video Session', status: 'upcoming', fee: 800 },
  { id: 5, therapist: 'Selam G.', therapistId: 4, avatar: 'https://i.pravatar.cc/150?img=9', date: '2025-03-15', time: '3:00 PM', type: 'Video Session', status: 'completed', fee: 800 },
];

export default function TherapistAppointmentsPage() {
  const upcoming = allAppointments.filter(a => a.status === 'upcoming');
  const past = allAppointments.filter(a => a.status !== 'upcoming');

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Appointments" description="Manage your upcoming and completed client sessions" />

      <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Upcoming Sessions</h2>
      <div className="space-y-3 mb-8">
        {upcoming.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <img src={a.avatar} alt="" className="w-11 h-11 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{a.therapist}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{a.time}</span>
                <span className="flex items-center gap-1"><Video size={11} />{a.type}</span>
              </div>
            </div>
            <StatusBadge status={a.status} />
            <Link to="/therapist/sessions" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">Join</Link>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-teal-500" /> Past Sessions</h2>
      <div className="space-y-3">
        {past.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <img src={a.avatar} alt="" className="w-11 h-11 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{a.therapist}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{a.time}</span>
              </div>
            </div>
            <StatusBadge status={a.status} />
            <span className="text-sm font-medium text-gray-600">ETB {a.fee}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
