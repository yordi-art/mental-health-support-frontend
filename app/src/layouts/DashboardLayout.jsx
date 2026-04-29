import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import NotificationBell from '../components/common/NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children, sidebarItems, userName = 'User' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <div className="w-7 h-7 bg-brand-gradient rounded-lg flex items-center justify-center">
              <Heart size={14} className="fill-white text-white" />
            </div>
            MindBridge
          </Link>
          <button className="ml-auto md:hidden p-1 rounded-lg hover:bg-gray-50" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sidebarItems.map(item => {
            const active = pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all
                  ${active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-slate-800'}`}>
                <item.icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={13} className="opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="text-xs font-medium text-slate-700 truncate">{userName}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition w-full px-3 py-2 rounded-xl hover:bg-red-50">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-30">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
