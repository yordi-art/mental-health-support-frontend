import { TrendingUp, Users, Calendar, DollarSign, Star, Activity } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';

const monthlyData = [
  { month: 'Nov', users: 80, sessions: 120, revenue: 96000 },
  { month: 'Dec', users: 110, sessions: 160, revenue: 128000 },
  { month: 'Jan', users: 145, sessions: 210, revenue: 168000 },
  { month: 'Feb', users: 190, sessions: 280, revenue: 224000 },
  { month: 'Mar', users: 240, sessions: 360, revenue: 288000 },
  { month: 'Apr', users: 310, sessions: 450, revenue: 360000 },
];

const maxSessions = Math.max(...monthlyData.map(d => d.sessions));

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Analytics" description="Platform growth, usage trends, and performance metrics" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: '1,240', change: '+18%', icon: Users, color: 'text-primary bg-blue-50' },
          { label: 'Sessions This Month', value: '450', change: '+25%', icon: Calendar, color: 'text-teal-600 bg-teal-50' },
          { label: 'Monthly Revenue', value: 'ETB 360K', change: '+25%', icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Avg. Rating', value: '4.8 ★', change: '+0.1', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color.split(' ')[1]}`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className={s.color.split(' ')[0]} />
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">{s.change}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sessions Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={16} className="text-primary" />
          <h2 className="font-semibold text-slate-800">Monthly Sessions</h2>
        </div>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{d.sessions}</span>
              <div className="w-full bg-primary rounded-t-lg transition-all hover:bg-blue-600"
                style={{ height: `${(d.sessions / maxSessions) * 120}px` }} />
              <span className="text-xs text-gray-400">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Monthly Growth</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Month', 'New Users', 'Sessions', 'Revenue'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().map(d => (
                <tr key={d.month} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-700">{d.month} 2025</td>
                  <td className="px-4 py-3 text-gray-600">{d.users}</td>
                  <td className="px-4 py-3 text-gray-600">{d.sessions}</td>
                  <td className="px-4 py-3 font-medium text-teal-600">ETB {d.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
