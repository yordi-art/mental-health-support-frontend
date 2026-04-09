import { useState } from 'react';
import { Users, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const initialRequests = [
  { id: 1, name: 'Yordanos T.', issue: 'Anxiety & Stress', score: 'PHQ-9: 7 (Mild)', date: '2025-04-08', avatar: 'https://i.pravatar.cc/150?img=5', status: 'pending' },
  { id: 2, name: 'Biruk M.', issue: 'Depression', score: 'PHQ-9: 12 (Moderate)', date: '2025-04-09', avatar: 'https://i.pravatar.cc/150?img=8', status: 'pending' },
  { id: 3, name: 'Hana T.', issue: 'Work Burnout', score: 'GAD-7: 8 (Moderate)', date: '2025-04-07', avatar: 'https://i.pravatar.cc/150?img=32', status: 'accepted' },
  { id: 4, name: 'Dawit A.', issue: 'Grief & Loss', score: 'PHQ-9: 15 (Moderate Severe)', date: '2025-04-06', avatar: 'https://i.pravatar.cc/150?img=15', status: 'declined' },
];

const statusStyle = { pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-600' };

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState('all');

  const update = (id, status) => setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Client Requests" description="Review and respond to incoming client session requests" />

      <div className="flex gap-2 mb-5">
        {['all', 'pending', 'accepted', 'declined'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <img src={r.avatar} alt="" className="w-11 h-11 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{r.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.issue} · {r.score}</p>
              <p className="text-xs text-gray-400 mt-0.5">Requested {r.date}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyle[r.status]}`}>{r.status}</span>
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => update(r.id, 'accepted')} className="flex items-center gap-1 text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 transition">
                  <CheckCircle size={12} /> Accept
                </button>
                <button onClick={() => update(r.id, 'declined')} className="flex items-center gap-1 text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  <XCircle size={12} /> Decline
                </button>
              </div>
            )}
            {r.status === 'accepted' && (
              <button className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <MessageSquare size={12} /> Message
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
