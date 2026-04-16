import { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, Search, SlidersHorizontal, BookOpen, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { publicAPI } from '../../api';

const specializations = ['All', 'Anxiety & Depression', 'Trauma & PTSD', 'Stress & Burnout', 'Child & Adolescent', 'Relationship Issues', 'Grief & Loss'];

export default function PublicTherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const params = {};
    if (filter !== 'All') params.specialization = filter;
    if (search) params.search = search;

    setLoading(true);
    publicAPI.getTherapists(params)
      .then(res => setTherapists(res.data || []))
      .catch(() => setTherapists([]))
      .finally(() => setLoading(false));
  }, [filter, search]);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Find Your <span className="text-primary">Verified Therapist</span></h1>
        <p className="text-gray-500 max-w-lg mx-auto">Browse our network of system-verified mental health professionals. Every therapist is credentialed and ready to support you.</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {specializations.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : therapists.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No verified therapists found</p>
            <p className="text-sm mt-1">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">{therapists.length} verified therapist{therapists.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {therapists.map(t => {
                const initials = t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={t._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      {t.profileImage ? (
                        <img src={t.profileImage} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold">{initials}</div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-slate-800">{t.name}</p>
                          <CheckCircle size={14} className="text-teal-500" />
                        </div>
                        <p className="text-xs text-gray-500">{(t.specialization || []).join(', ')}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium">{t.rating || '—'}</span>
                          <span className="text-xs text-gray-400">({t.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} />{t.experienceYears} yrs exp</span>
                      <span className="flex items-center gap-1"><DollarSign size={12} />ETB {t.hourlyRate}/hr</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{t.bio}</p>
                    <div className="flex gap-2 mt-auto">
                      <Link to={`/therapists/${t._id}`} className="flex-1 text-center text-xs border border-primary text-primary rounded-lg py-1.5 hover:bg-blue-50 transition">View Profile</Link>
                      <Link to="/register" className="flex-1 text-center text-xs bg-primary text-white rounded-lg py-1.5 hover:bg-blue-600 transition">Book Session</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
