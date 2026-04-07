import { useState } from 'react';
import { ShieldOff, Eye, UserCheck, UserX } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import { adminSidebarItems } from '../../components/admin/adminNav';

const users = [
  { id: 1, name: 'Yordanos Tadesse', email: 'yordanos@example.com', role: 'client', joined: '2025-03-01', status: 'active', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Dr. Sarah Mengistu', email: 'sarah@example.com', role: 'therapist', joined: '2025-02-15', status: 'active', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 3, name: 'Biruk Mekonnen', email: 'biruk@example.com', role: 'client', joined: '2025-03-10', status: 'active', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 4, name: 'Dr. Dawit Haile', email: 'dawit@example.com', role: 'therapist', joined: '2025-04-01', status: 'suspended', avatar: 'https://i.pravatar.cc/150?img=15' },
  { id: 5, name: 'Selam Girma', email: 'selam@example.com', role: 'client', joined: '2025-03-22', status: 'active', avatar: 'https://i.pravatar.cc/150?img=9' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = users.filter(u =>
    (filter === 'all' || u.role === filter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="User Management" description="Manage clients, therapists and platform accounts" />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 max-w-xs"><SearchBar placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="flex gap-2">
          {['all', 'client', 'therapist'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-slate-700">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.role === 'therapist' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="View" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                      {u.status === 'active'
                        ? <button title="Suspend" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><ShieldOff size={14} /></button>
                        : <button title="Activate" className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition"><UserCheck size={14} /></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
