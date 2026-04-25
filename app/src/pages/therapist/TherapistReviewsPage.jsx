import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';
import { therapistAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function TherapistReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    therapistAPI.getReviews()
      .then(res => setReviews(res.data?.reviews || res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

  if (loading) return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={user?.name || 'Therapist'}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={user?.name || 'Therapist'}>
      <PageHeader title="Client Reviews" description="Feedback from your clients about their sessions" />

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No reviews yet.</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center max-w-2xl">
            <div className="text-center">
              <p className="text-5xl font-bold text-slate-800">{avg}</p>
              <div className="flex gap-0.5 justify-center my-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
              </div>
              <p className="text-xs text-gray-400">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {dist.map(d => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-gray-500">{d.star}</span>
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-4 text-gray-400">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            {reviews.map(r => (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {r.clientId?.name?.[0] || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{r.clientId?.name || 'Client'}</p>
                    <p className="text-xs text-gray-400">{r.createdAt?.slice(0, 10)}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">"{r.comment || r.text}"</p>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
