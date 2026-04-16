import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientAPI.getAppointments()
      .then(res => setAppointments(res.data?.appointments || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const past = appointments.filter(a => a.status !== 'upcoming');

  if (loading) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <PageHeader title="My Appointments" description="Manage your upcoming and past therapy sessions" />

      <div className="flex justify-end mb-5">
        <Link to="/client/therapists" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">+ Book New Session</Link>
      </div>

      <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Upcoming Sessions</h2>
      {upcoming.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
          <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No upcoming sessions. <Link to="/client/therapists" className="text-primary hover:underline">Book one now</Link></p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {upcoming.map(a => (
            <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {a.therapistName?.[0] || 'T'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{a.therapistName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{a.time}</span>
                  <span className="flex items-center gap-1"><Video size={11} />{a.type}</span>
                </div>
              </div>
              <StatusBadge status={a.status} />
              <div className="flex gap-2">
                <Link to="/client/session" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">Join</Link>
                <button className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Reschedule</button>
                <button
                  onClick={() => clientAPI.cancelAppointment(a._id).then(() => setAppointments(prev => prev.filter(x => x._id !== a._id)))}
                  className="text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-teal-500" /> Past Sessions</h2>
      {past.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No past sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {past.map(a => (
            <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
                {a.therapistName?.[0] || 'T'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{a.therapistName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{a.time}</span>
                </div>
              </div>
              <StatusBadge status={a.status} />
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 font-medium">ETB {a.fee}</span>
                <Link to={`/client/reviews/new/${a.therapistId}`} className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Review</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
