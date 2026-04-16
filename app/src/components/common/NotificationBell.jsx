import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, CreditCard, ShieldCheck, Megaphone, X, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const typeIcon = {
  appointment_reminder: Calendar,
  appointment_confirmed: Calendar,
  appointment_cancelled: Calendar,
  payment_success: CreditCard,
  payment_failed: CreditCard,
  verification_status: ShieldCheck,
  system: Megaphone,
};

const typeColor = {
  appointment_reminder: 'bg-blue-50 text-primary',
  appointment_confirmed: 'bg-success/10 text-success',
  appointment_cancelled: 'bg-error/10 text-error',
  payment_success: 'bg-success/10 text-success',
  payment_failed: 'bg-error/10 text-error',
  verification_status: 'bg-teal/10 text-teal',
  system: 'bg-warning/10 text-warning',
};

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('mhUser') || 'null');
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`, { headers: getAuthHeader() });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`${API}/notifications/read`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  // Socket.io real-time
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('mhUser') || 'null');
    if (!user?.id && !user?._id) return;
    const userId = user.id || user._id;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.emit('join', userId);
    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(c => c + 1);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <span className="font-semibold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-error/10 text-error px-1.5 py-0.5 rounded-full font-medium">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Mark all read" className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-primary transition">
                  <CheckCheck size={15} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = typeIcon[n.type] || Bell;
                const colorCls = typeColor[n.type] || 'bg-gray-50 text-gray-500';
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markOneRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100">
              <a href="/client/notifications" className="text-xs text-primary hover:underline font-medium">View all notifications →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
