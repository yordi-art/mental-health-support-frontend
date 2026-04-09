import { Star, Eye, Flag } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';

const allReviews = [
  { id: 1, client: 'Yordanos T.', therapist: 'Dr. Sarah Mengistu', rating: 5, text: 'Very understanding and professional. I felt heard for the first time.', date: '2025-03-29', flagged: false },
  { id: 2, client: 'Biruk M.', therapist: 'Dr. Yonas Bekele', rating: 5, text: 'The CBT techniques she shared were incredibly helpful.', date: '2025-03-11', flagged: false },
  { id: 3, client: 'Selam G.', therapist: 'Dr. Hana Tadesse', rating: 2, text: 'Session was cut short and therapist seemed distracted.', date: '2025-03-05', flagged: true },
  { id: 4, client: 'Hana T.', therapist: 'Dr. Kebede Alemu', rating: 4, text: 'Good session overall. Would recommend.', date: '2025-02-28', flagged: false },
];

const avg = (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1);

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(allReviews);
  const [filter, setFilter] = useState('all');

  const filtered = reviews.filter(r => filter === 'all' || (filter === 'flagged' && r.flagged));
  const toggleFlag = (id) => setReviews(reviews.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Reviews Monitor" description="Monitor client feedback and flag inappropriate reviews" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'text-primary bg-blue-50' },
          { label: 'Average Rating', value: `${avg} ★`, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Flagged', value: reviews.filter(r => r.flagged).length, color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[1]}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {['all', 'flagged'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${r.flagged ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-slate-700">{r.client}</span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-sm text-gray-600">{r.therapist}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                  </div>
                  {r.flagged && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Flagged</span>}
                </div>
                <p className="text-sm text-gray-600">"{r.text}"</p>
                <p className="text-xs text-gray-400 mt-1">{r.date}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                <button onClick={() => toggleFlag(r.id)} className={`p-1.5 rounded-lg transition ${r.flagged ? 'bg-red-100 text-red-500' : 'hover:bg-orange-50 text-orange-500'}`}><Flag size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
