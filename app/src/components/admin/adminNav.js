import { LayoutDashboard, ShieldCheck, Users, Calendar, CreditCard, Flag, Star, BarChart2, Settings } from 'lucide-react';

export const adminSidebarItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Verification Monitor', to: '/admin/verifications', icon: ShieldCheck },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Appointments', to: '/admin/appointments', icon: Calendar },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Reports / Issues', to: '/admin/reports', icon: Flag },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];
