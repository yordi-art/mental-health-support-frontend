import { LayoutDashboard, ClipboardList, BarChart2, Search, Calendar, Video, CreditCard, Star, Bell, User } from 'lucide-react';

export const clientSidebarItems = [
  { label: 'My Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Take Assessment', to: '/client/assessment', icon: ClipboardList },
  { label: 'My Results', to: '/client/results', icon: BarChart2 },
  { label: 'Find Therapist', to: '/client/therapists', icon: Search },
  { label: 'Appointments', to: '/client/appointments', icon: Calendar },
  { label: 'Video Session', to: '/client/session', icon: Video },
  { label: 'Payments', to: '/client/payments', icon: CreditCard },
  { label: 'Reviews', to: '/client/reviews', icon: Star },
  { label: 'Notifications', to: '/client/notifications', icon: Bell },
  { label: 'My Profile', to: '/client/profile', icon: User },
];
