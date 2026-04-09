import { useState } from 'react';
import { Star, CheckCircle, Clock, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { therapists } from '../../data/sampleData';

const specializations = ['All', 'Anxiety & Depression', 'Trauma & PTSD', 'Stress & Burnout', 'Child & Adolescent'];

export default function PublicTherapistsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [availOnly, setAvailOnly] = useState(false);

  const filtered = therapists.filter(t =>
    (filter === 'All' || t.specialization === filter) &&
    (!availOnly || t.available) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Find Your <span className="text-primary">Verified Therapist</span></h1>
        <p className="text-gray-500 max-w-lg mx-auto">Browse our network of system-verified mental health professionals. Every therapist is credentialed and ready to support you.</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        {/* Filters */}
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
            <button onClick={() => setAvailOnly(!availOnly)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition ${availOnly ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <SlidersHorizontal size={12} /> Available Only
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-5">{filtered.length} therapist{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
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
                    <span className="text-xs text-gray-400">({t.reviews})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} /><span>{t.experience} yrs experience</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${t.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{t.bio}</p>
              <div className="flex gap-2 mt-auto">
                <Link to={`/therapists/${t.id}`} className="flex-1 text-center text-xs border border-primary text-primary rounded-lg py-1.5 hover:bg-blue-50 transition">View Profile</Link>
                <Link to="/register" className="flex-1 text-center text-xs bg-primary text-white rounded-lg py-1.5 hover:bg-blue-600 transition">Book Session</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
