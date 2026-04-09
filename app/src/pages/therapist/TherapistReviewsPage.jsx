import { Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const reviewsData = [
  { id: 1, name: 'Yordanos T.', avatar: 'https://i.pravatar.cc/150?img=5', rating: 5, text: 'Very understanding and professional. I felt heard for the first time.', date: '2025-03-29' },
  { id: 2, name: 'Selam G.', avatar: 'https://i.pravatar.cc/150?img=9', rating: 5, text: 'The CBT techniques she shared were incredibly helpful for my anxiety.', date: '2025-03-11' },
  { id: 3, name: 'Biruk M.', avatar: 'https://i.pravatar.cc/150?img=8', rating: 4, text: 'Great session. I appreciated the structured approach and follow-up tips.', date: '2025-02-28' },
  { id: 4, name: 'Hana T.', avatar: 'https://i.pravatar.cc/150?img=32', rating: 5, text: 'I finally feel like I have tools to manage my stress. Thank you!', date: '2025-02-15' },
];

const avg = (reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length).toFixed(1);

export default function TherapistReviewsPage() {
  const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviewsData.filter(r => r.rating === s).length }));

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Client Reviews" description="Feedback from your clients about their sessions" />

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center max-w-2xl">
        <div className="text-center">
          <p className="text-5xl font-bold text-slate-800">{avg}</p>
          <div className="flex gap-0.5 justify-center my-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
          </div>
          <p className="text-xs text-gray-400">{reviewsData.length} reviews</p>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {dist.map(d => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-gray-500">{d.star}</span>
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(d.count / reviewsData.length) * 100}%` }} />
              </div>
              <span className="w-4 text-gray-400">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-w-2xl">
        {reviewsData.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{r.name}</p>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
              </div>
            </div>
            <p className="text-sm text-gray-600">"{r.text}"</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
