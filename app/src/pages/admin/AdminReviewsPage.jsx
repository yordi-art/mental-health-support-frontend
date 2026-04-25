import { useState, useEffect } from 'react';
import { Star, Eye, Flag } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminAPI } from '../../api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReviews()
      .then(res => setReviews(res.data?.reviews || res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reviews.filter(r => filter === 'all' || (filter === 'flagged' && r.flagged));
  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '—';

  const toggleFlag = async (id, current) => {
    try {
      setReviews(reviews.map(r => (r._id || r.id) === id ? { ...r, flagged: !current } : r));
    } catch {}
  };

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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">No reviews found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const id = r._id || r.id;
            const clientName = r.clientId?.name || r.client || 'Client';
            const therapistName = r.therapistId?.name || r.therapist || 'Therapist';
            return (
              <div key={id} className={`bg-white rounded-2xl border shadow-sm p-4 ${r.flagged ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-slate-700">{clientName}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-sm text-gray-600">{therapistName}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={11} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                      </div>
                      {r.flagged && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Flagged</span>}
                    </div>
                    <p className="text-sm text-gray-600">"{r.comment || r.text}"</p>
                    <p className="text-xs text-gray-400 mt-1">{r.createdAt?.slice(0, 10) || r.date}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                    <button onClick={() => toggleFlag(id, r.flagged)} className={`p-1.5 rounded-lg transition ${r.flagged ? 'bg-red-100 text-red-500' : 'hover:bg-orange-50 text-orange-500'}`}><Flag size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
