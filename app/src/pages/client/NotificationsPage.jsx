import { Bell, Calendar, CreditCard, Lightbulb, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { notifications } from '../../data/sampleData';

const typeIcon = { appointment: Calendar, payment: CreditCard, assessment: Bell, tip: Lightbulb };
const typeColor = { appointment: 'text-primary bg-blue-50', payment: 'text-teal-600 bg-teal-50', assessment: 'text-purple-600 bg-purple-50', tip: 'text-yellow-600 bg-yellow-50' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const unread = notifs.filter(n => !n.read).length;

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
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

      <div className="space-y-3 max-w-2xl">
        {notifs.map(n => {
          const Icon = typeIcon[n.type] || Bell;
          const colorCls = typeColor[n.type] || 'text-gray-500 bg-gray-50';
          return (
            <div key={n.id} onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${!n.read ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? 'font-medium text-slate-800' : 'text-slate-700'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
