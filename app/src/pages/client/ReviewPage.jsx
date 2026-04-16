import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI, publicAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ReviewPage() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [therapist, setTherapist] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getTherapistById(therapistId)
      .then(res => setTherapist(res.data?.therapist || res.data))
      .catch(() => {});
  }, [therapistId]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await clientAPI.createReview({ therapistId, rating, comment: text });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const name = therapist?.userId?.name || therapist?.name || 'Therapist';

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Review Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Thank you for sharing your experience with {name}.</p>
          <button onClick={() => navigate('/client/sessions')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">Back to Sessions</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Leave a Review</h1>
        <p className="text-sm text-gray-500 mb-6">Share your experience to help others find the right support</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{name}</p>
              <p className="text-xs text-gray-500">{(therapist?.specialization || []).join(', ')}</p>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-3">How would you rate your session?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
                  <Star size={32} className={`transition ${s <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-xs text-gray-500 mt-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>}
          </div>

          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-1">Share your experience</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
              placeholder="How did the session help you? What did you appreciate most?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

          <button disabled={rating === 0 || text.trim().length < 10 || loading}
            onClick={handleSubmit}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
