import { Bell, Calendar, CreditCard, ClipboardList, Lightbulb, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { notifications as data } from '../../data/sampleData';

const typeIcon = { appointment: Calendar, payment: CreditCard, assessment: ClipboardList, tip: Lightbulb };
const typeColor = { appointment: 'text-primary bg-blue-50', payment: 'text-teal-600 bg-teal-50', assessment: 'text-yellow-600 bg-yellow-50', tip: 'text-purple-600 bg-purple-50' };

export default function NotificationsPage() {
  const [items, setItems] = useState(data);
  const unread = items.filter(n => !n.read).length;

  const markAll = () => setItems(items.map(n => ({ ...n, read: true })));

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader
        title="Notifications"
        description={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        action={unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      />
      <div className="space-y-2">
        {items.map(n => {
          const Icon = typeIcon[n.type] || Bell;
          const colors = typeColor[n.type] || 'text-gray-500 bg-gray-50';
          return (
            <div key={n.id} onClick={() => setItems(items.map(x => x.id === n.id ? { ...x, read: true } : x))}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition
                ${!n.read ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? 'font-medium text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
