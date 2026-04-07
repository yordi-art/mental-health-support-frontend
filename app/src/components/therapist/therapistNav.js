import { LayoutDashboard, ShieldCheck, Calendar, Users, Video, Star, DollarSign, User, Settings, Clock } from 'lucide-react';

export const therapistSidebarItems = [
  { label: 'Dashboard', to: '/therapist/dashboard', icon: LayoutDashboard },
  { label: 'Verification Status', to: '/therapist/verification', icon: ShieldCheck },
  { label: 'Availability', to: '/therapist/availability', icon: Clock },
  { label: 'Appointments', to: '/therapist/appointments', icon: Calendar },
  { label: 'Client Requests', to: '/therapist/requests', icon: Users },
  { label: 'Video Sessions', to: '/therapist/sessions', icon: Video },
  { label: 'Reviews', to: '/therapist/reviews', icon: Star },
  { label: 'Earnings', to: '/therapist/earnings', icon: DollarSign },
  { label: 'My Profile', to: '/therapist/profile', icon: User },
  { label: 'Settings', to: '/therapist/settings', icon: Settings },
];
