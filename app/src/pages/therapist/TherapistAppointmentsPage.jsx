import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { therapistAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function TherapistAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    therapistAPI.getAppointments()
      .then(res => setAppointments(res.data?.appointments || res.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['upcoming', 'confirmed', 'pending'].includes(a.status));
  const past = appointments.filter(a => !['upcoming', 'confirmed', 'pending'].includes(a.status));

  const AppointmentRow = ({ a, showJoin }) => (
    <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
        {a.clientId?.name?.[0] || 'C'}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{a.clientId?.name || 'Client'}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span className="flex items-center gap-1"><Calendar size={11} />{a.date?.slice(0, 10)}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{a.time}</span>
          <span className="flex items-center gap-1"><Video size={11} />{a.sessionType || 'Video Session'}</span>
        </div>
      </div>
      <StatusBadge status={a.status} />
      {showJoin
        ? <Link to="/therapist/sessions" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">Join</Link>
        : <span className="text-sm font-medium text-gray-600">{a.fee ? `ETB ${a.fee}` : '—'}</span>
      }
    </div>
  );

  if (loading) return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={user?.name || 'Therapist'}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={user?.name || 'Therapist'}>
      <PageHeader title="Appointments" description="Manage your upcoming and completed client sessions" />

      <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Upcoming Sessions</h2>
      <div className="space-y-3 mb-8">
        {upcoming.length === 0
          ? <p className="text-sm text-gray-400 text-center py-6">No upcoming sessions.</p>
          : upcoming.map(a => <AppointmentRow key={a._id} a={a} showJoin />)
        }
      </div>

      <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-teal-500" /> Past Sessions</h2>
      <div className="space-y-3">
        {past.length === 0
          ? <p className="text-sm text-gray-400 text-center py-6">No past sessions.</p>
          : past.map(a => <AppointmentRow key={a._id} a={a} showJoin={false} />)
        }
      </div>
    </DashboardLayout>
  );
}
