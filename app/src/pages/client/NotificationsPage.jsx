import { Bell, Calendar, CreditCard, Lightbulb, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { notificationAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const typeIcon = { appointment: Calendar, payment: CreditCard, assessment: Bell, tip: Lightbulb, verification_status: Bell, appointment_reminder: Calendar, appointment_confirmed: Calendar, appointment_cancelled: Calendar };
const typeColor = { appointment: 'text-primary bg-blue-50', payment: 'text-teal-600 bg-teal-50', assessment: 'text-purple-600 bg-purple-50', tip: 'text-yellow-600 bg-yellow-50', verification_status: 'text-orange-600 bg-orange-50', appointment_reminder: 'text-primary bg-blue-50', appointment_confirmed: 'text-teal-600 bg-teal-50', appointment_cancelled: 'text-red-500 bg-red-50' };

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then(res => setNotifs(res.data?.notifications || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unread = notifs.filter(n => !n.isRead).length;

  const markAllRead = () => {
    const ids = notifs.filter(n => !n.isRead).map(n => n._id);
    if (ids.length) notificationAPI.markRead(ids).catch(() => {});
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
  };

  const markOne = (id) => {
    notificationAPI.markRead([id]).catch(() => {});
    setNotifs(notifs.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-primary hover:underline">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-12">No notifications yet.</p>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {notifs.map(n => {
            const Icon = typeIcon[n.type] || Bell;
            const colorCls = typeColor[n.type] || 'text-gray-500 bg-gray-50';
            return (
              <div key={n._id} onClick={() => markOne(n._id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${!n.isRead ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!n.isRead ? 'font-medium text-slate-800' : 'text-slate-700'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
