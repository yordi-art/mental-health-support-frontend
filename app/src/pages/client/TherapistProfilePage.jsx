import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, Clock, Globe, DollarSign, ArrowLeft, Calendar } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists, reviews } from '../../data/sampleData';

export default function TherapistProfilePage() {
  const { id } = useParams();
  const t = therapists.find(x => x.id === Number(id)) || therapists[0];
  const therapistReviews = reviews.filter(r => r.therapistId === t.id);

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <Link to="/client/therapists" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-5 transition">
        <ArrowLeft size={15} /> Back to Therapists
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-5">
              <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-800">{t.name}</h1>
                  {t.verified && (
                    <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                      <CheckCircle size={11} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{t.specialization}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400 fill-yellow-400" />{t.rating} ({t.reviews} reviews)</span>
                  <span className="flex items-center gap-1"><Clock size={13} />{t.experience} yrs experience</span>
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${t.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">{t.bio}</p>
          </div>

          {/* Support Areas */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-3">Areas of Support</h2>
            <div className="flex flex-wrap gap-2">
              {t.areas.map(a => (
                <span key={a} className="bg-blue-50 text-primary text-xs px-3 py-1 rounded-full border border-blue-100">{a}</span>
              ))}
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-teal-500" /> Professional Verification</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Verification Status</p>
                <p className="font-medium text-teal-600">System Verified ✓</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Issuing Authority</p>
                <p className="font-medium text-slate-700">{t.authority}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Client Reviews</h2>
            {therapistReviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {therapistReviews.map(r => (
                  <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">Anonymous Client</span>
                      <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}</div>
                    </div>
                    <p className="text-sm text-gray-600">"{r.text}"</p>
                    <p className="text-xs text-gray-400 mt-1">{r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Booking Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">Session Fee</p>
                <p className="text-2xl font-bold text-slate-800">ETB {t.price}</p>
                <p className="text-xs text-gray-400">per session</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={16} className="fill-yellow-400" />
                <span className="font-semibold">{t.rating}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Globe size={14} className="text-gray-400" />
                <span>{t.languages.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign size={14} className="text-gray-400" />
                <span>ETB {t.price} / 50-min session</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span>{t.available ? 'Available for booking' : 'Currently unavailable'}</span>
              </div>
            </div>
            {t.available ? (
              <Link to={`/client/book/${t.id}`} className="block w-full text-center bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition">
                Book a Session
              </Link>
            ) : (
              <button disabled className="block w-full text-center bg-gray-100 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed">
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
