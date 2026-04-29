import { Star, CheckCircle, Clock, DollarSign, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TherapistCard({ t }) {
  const initials = (t.name || t.userId?.name || 'T')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const name = t.name || t.userId?.name || 'Therapist';
  const specs = Array.isArray(t.specialization) ? t.specialization : [t.specialization].filter(Boolean);
  const id = t._id || t.id;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-200 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {t.profileImage || t.avatar ? (
          <img src={t.profileImage || t.avatar} alt={name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-slate-800 truncate">{name}</p>
            <CheckCircle size={13} className="text-teal-500 flex-shrink-0" />
          </div>
          <p className="text-xs text-gray-500 truncate">{t.workplace || specs[0] || ''}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-slate-700">{t.rating || '—'}</span>
            <span className="text-xs text-gray-400">({t.reviewCount || t.reviews || 0})</span>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specs.slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full font-medium">{s}</span>
          ))}
        </div>
      )}

      {t.bio && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.bio}</p>}

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><BookOpen size={11} /> {t.experienceYears || t.experience || 0}y exp</span>
        <span className="flex items-center gap-1"><DollarSign size={11} /> ETB {t.hourlyRate || '—'}/hr</span>
        {(t.availability?.length > 0) && (
          <span className="flex items-center gap-1"><Clock size={11} /> {t.availability.length}d/wk</span>
        )}
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        <Link to={`/client/therapists/${id}`}
          className="flex-1 text-center text-xs border border-gray-200 text-gray-600 rounded-xl py-2 hover:bg-gray-50 hover:border-gray-300 transition font-medium">
          View Profile
        </Link>
        <Link to={`/client/book/${id}`}
          className="flex-1 text-center text-xs bg-primary text-white rounded-xl py-2 hover:bg-primary-dark transition font-semibold">
          Book Session
        </Link>
      </div>
    </div>
  );
}
