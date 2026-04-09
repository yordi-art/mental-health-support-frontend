import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists } from '../../data/sampleData';

export default function ReviewPage() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const t = therapists.find(th => th.id === Number(therapistId)) || therapists[0];
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Review Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Thank you for sharing your experience with {t.name}. Your feedback helps others find the right support.</p>
          <button onClick={() => navigate('/client/sessions')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">Back to Sessions</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Leave a Review</h1>
        <p className="text-sm text-gray-500 mb-6">Share your experience to help others find the right support</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Therapist */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-semibold text-slate-800">{t.name}</p>
              <p className="text-xs text-gray-500">{t.specialization}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-3">How would you rate your session?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
                  <Star size={32} className={`transition ${s <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>
            )}
          </div>

          {/* Text */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-1">Share your experience</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
              placeholder="How did the session help you? What did you appreciate most?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>

          <button disabled={rating === 0 || text.trim().length < 10}
            onClick={() => setSubmitted(true)}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Review
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
