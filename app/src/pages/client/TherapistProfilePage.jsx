import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, Clock, Globe, Award, Calendar, DollarSign, Loader2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { publicAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function TherapistProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    publicAPI.getTherapistById(id)
      .then(res => setTherapist(res.data))
      .catch(() => setError('Therapist not found or no longer available.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !therapist) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
        <div className="text-center py-20 text-gray-400">
          <p className="font-semibold text-lg">{error || 'Therapist not found'}</p>
          <Link to="/client/therapists" className="text-primary text-sm mt-3 inline-block hover:underline">
            ← Back to therapists
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const t = therapist;
  const initials = t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const hasAvailability = Array.isArray(t.availability) && t.availability.length > 0;

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <div className="max-w-3xl">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-5 flex flex-col sm:flex-row gap-5 items-start">
          {t.profileImage ? (
            <img src={t.profileImage} alt={t.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 ring-2 ring-gray-100" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{t.name}</h1>
              <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-semibold">
                <CheckCircle size={11} /> Verified
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{t.workplace || (t.specialization || []).join(', ')}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                {t.rating || '—'} ({t.reviewCount || 0} reviews)
              </span>
              <span className="flex items-center gap-1"><Clock size={12} /> {t.experienceYears || 0} yrs experience</span>
              <span className="flex items-center gap-1"><DollarSign size={12} /> ETB {t.hourlyRate}/hr</span>
            </div>
            {t.languages?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {t.languages.map(l => (
                  <span key={l} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Globe size={9} /> {l}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link to={`/client/book/${t._id}`}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition text-sm text-center">
              Book Session
            </Link>
            <span className={`text-xs px-2 py-1.5 rounded-full text-center font-medium ${hasAvailability ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {hasAvailability ? '● Available' : '● Unavailable'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">

            {/* About */}
            {t.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <h2 className="font-semibold text-slate-800 mb-3">About</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{t.bio}</p>
              </div>
            )}

            {/* Specializations */}
            {t.specialization?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <h2 className="font-semibold text-slate-800 mb-3">Areas of Focus</h2>
                <div className="flex flex-wrap gap-2">
                  {t.specialization.map(s => (
                    <span key={s} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full border border-blue-100 font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-semibold text-slate-800 mb-4">
                Client Reviews
                {t.reviewCount > 0 && <span className="text-xs text-gray-400 font-normal ml-2">({t.reviewCount} total)</span>}
              </h2>
              {t.reviewCount === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No reviews yet.</p>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-3xl font-bold text-amber-500">{t.rating}</div>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} className={i <= Math.round(t.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{t.reviewCount} verified review{t.reviewCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Availability */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar size={15} className="text-primary" /> Availability
              </h2>
              {hasAvailability ? (
                <div className="space-y-1.5">
                  {t.availability.map(slot => (
                    <div key={slot.day} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">{slot.day}</span>
                      <span className="text-green-600 font-medium">{slot.startTime} – {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No schedule set yet.</p>
              )}
              <Link to={`/client/book/${t._id}`}
                className="mt-4 block text-center bg-primary text-white py-2 rounded-xl text-xs font-semibold hover:bg-blue-600 transition">
                Book Now
              </Link>
            </div>

            {/* Verified badge */}
            <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={15} className="text-teal-600" />
                <span className="font-semibold text-teal-700 text-sm">System Verified</span>
              </div>
              <p className="text-xs text-teal-600">License automatically verified by our AI system.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
