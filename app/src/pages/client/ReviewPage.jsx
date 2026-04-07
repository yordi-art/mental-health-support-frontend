import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists, reviews } from '../../data/sampleData';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <Star size={28} className={`transition ${i <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const { therapistId } = useParams();
  const t = therapists.find(x => x.id === Number(therapistId)) || therapists[0];
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Thank you for your review!</h2>
          <p className="text-gray-500 text-sm mb-6">Your feedback helps others find the right support.</p>
          <button onClick={() => navigate('/client/sessions')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
            Back to Sessions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Leave a Review</h1>
        <p className="text-sm text-gray-500 mb-6">Share your experience to help others on their wellness journey.</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          {/* Therapist */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-slate-800">{t.name}</p>
              <p className="text-xs text-gray-500">{t.specialization}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Your Rating</p>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Your Experience</p>
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

        {/* Past Reviews */}
        {reviews.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-800 mb-3">Your Past Reviews</h2>
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={r.avatar} alt="" className="w-9 h-9 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{r.therapist}</p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                    <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}</div>
                  </div>
                  <p className="text-sm text-gray-600">"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
