import { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, Search, DollarSign, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { publicAPI } from '../../api';

const specializations = ['All', 'Anxiety & Depression', 'Trauma & PTSD', 'Stress & Burnout', 'Child & Adolescent', 'Relationship Issues', 'Grief & Loss'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
          <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-2.5 bg-gray-100 rounded-full" />
        <div className="h-2.5 bg-gray-100 rounded-full w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

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
      <section className="bg-hero-gradient py-16 px-4 text-center">
        <span className="inline-block bg-blue-100 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">Our Therapists</span>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Find Your <span className="text-transparent bg-clip-text bg-brand-gradient">Verified Therapist</span>
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          Browse our network of AI-verified mental health professionals. Every therapist is credentialed and ready to support you.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {specializations.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === s ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : therapists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <CheckCircle size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-400">No verified therapists found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-5 font-medium">
              {therapists.length} verified therapist{therapists.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {therapists.map(t => {
                const initials = t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={t._id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 border border-gray-100 p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {t.profileImage ? (
                        <img src={t.profileImage} alt={t.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold flex-shrink-0">{initials}</div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-800">{t.name}</p>
                          <CheckCircle size={13} className="text-teal-500" />
                        </div>
                        <p className="text-xs text-gray-500">{(t.specialization || []).slice(0, 2).join(', ')}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold">{t.rating || '—'}</span>
                          <span className="text-xs text-gray-400">({t.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {t.experienceYears}y exp</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} /> ETB {t.hourlyRate}/hr</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.bio}</p>
                    <div className="flex gap-2 mt-auto">
                      <Link to={`/therapists/${t._id}`}
                        className="flex-1 text-center text-xs border border-gray-200 text-gray-600 rounded-xl py-2 hover:bg-gray-50 transition font-medium">
                        View Profile
                      </Link>
                      <Link to="/register"
                        className="flex-1 text-center text-xs bg-primary text-white rounded-xl py-2 hover:bg-primary-dark transition font-semibold">
                        Book Session
                      </Link>
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
