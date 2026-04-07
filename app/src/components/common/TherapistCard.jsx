import { Star, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TherapistCard({ t }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
        <div>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-slate-800">{t.name}</p>
            {t.verified && <CheckCircle size={14} className="text-teal-500" />}
          </div>
          <p className="text-xs text-gray-500">{t.specialization}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">{t.rating}</span>
            <span className="text-xs text-gray-400">({t.reviews} reviews)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock size={12} />
        <span>{t.experience} yrs experience</span>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${t.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {t.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2">{t.bio}</p>
      <div className="flex gap-2 mt-1">
        <Link to={`/client/therapists/${t.id}`} className="flex-1 text-center text-xs border border-primary text-primary rounded-lg py-1.5 hover:bg-blue-50 transition">View Profile</Link>
        <Link to="/client/appointments/book" className="flex-1 text-center text-xs bg-primary text-white rounded-lg py-1.5 hover:bg-blue-600 transition">Book Session</Link>
      </div>
    </div>
  );
}
