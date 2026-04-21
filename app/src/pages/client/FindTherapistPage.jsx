import { useState, useEffect } from 'react';
import { Star, Clock, DollarSign, BookOpen, Search, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI, publicAPI } from '../../api';

function TherapistCard({ t, aiMatchScore }) {
  const initials = t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        {t.profileImage ? (
          <img src={t.profileImage} alt={t.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{t.name}</h3>
          <p className="text-xs text-gray-500 truncate">{t.workplace}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-warning fill-warning" />
            <span className="text-xs font-medium text-slate-700">{t.rating || '—'}</span>
            <span className="text-xs text-gray-400">({t.reviewCount || 0} reviews)</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs bg-success/10 text-success font-semibold px-2 py-0.5 rounded-full">VERIFIED</span>
          {aiMatchScore != null && (
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Brain size={10} /> {Math.round(aiMatchScore * 100)}% match
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(t.specialization || []).slice(0, 3).map(s => (
          <span key={s} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      <p className="text-xs text-gray-500 line-clamp-2">{t.bio}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><BookOpen size={12} /> {t.experienceYears}y exp</span>
        <span className="flex items-center gap-1"><DollarSign size={12} /> ETB {t.hourlyRate}/hr</span>
        <span className="flex items-center gap-1"><Clock size={12} />
          {t.availability?.length > 0 ? `${t.availability.length} days/wk` : 'Check schedule'}
        </span>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link to={`/client/therapists/${t._id}`}
          className="flex-1 text-center text-xs border border-gray-200 text-gray-600 rounded-xl py-2 hover:bg-gray-50 transition">
          View Profile
        </Link>
        <Link to={`/client/book/${t._id}`}
          className="flex-1 text-center text-xs bg-primary text-white rounded-xl py-2 hover:bg-blue-600 transition font-medium">
          Book Session
        </Link>
      </div>
    </div>
  );
}

export default function FindTherapistPage() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const [therapists, setTherapists]     = useState([]);
  const [aiScores, setAiScores]         = useState({});   // id → aiMatchScore
  const [aiSeverity, setAiSeverity]     = useState(null); // from latest assessment
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('All');

  const SPECIALIZATIONS = ['All', 'Anxiety & Depression', 'Trauma & PTSD', 'Stress & Burnout', 'Relationship Issues', 'Grief & Loss'];

  useEffect(() => {
    const params = {};
    if (filter !== 'All') params.specialization = filter;
    if (search) params.search = search;

    setLoading(true);

    // Fetch therapists + AI recommendations in parallel
    Promise.all([
      publicAPI.getTherapists(params),
      clientAPI.getAssessmentResults().catch(() => ({ data: [] })),
    ]).then(([thRes, assessRes]) => {
      const allTherapists = thRes.data || [];
      setTherapists(allTherapists);

      // Get latest assessment severity for AI matching
      const assessments = assessRes.data?.assessments || assessRes.data || [];
      const latest = assessments[0];

      if (latest?.resultCategory) {
        setAiSeverity(latest.resultCategory);
        // Call AI match endpoint with latest severity
        clientAPI.getRecommendations()
          .then(recRes => {
            const recommended = recRes.data?.recommendedTherapists || [];
            // Build a map of therapist id → aiMatchScore
            const scoreMap = {};
            recommended.forEach(r => { if (r.id) scoreMap[r.id] = r.aiMatchScore; });
            setAiScores(scoreMap);

            // Re-sort therapists: AI matched ones first
            setTherapists(prev => {
              const withScore = prev.map(t => ({ ...t, _aiScore: scoreMap[String(t._id)] ?? null }));
              return withScore.sort((a, b) => {
                if (a._aiScore != null && b._aiScore != null) return b._aiScore - a._aiScore;
                if (a._aiScore != null) return -1;
                if (b._aiScore != null) return 1;
                return 0;
              });
            });
          })
          .catch(() => {}); // AI service down — just show plain list
      }
    })
    .catch(() => setTherapists([]))
    .finally(() => setLoading(false));
  }, [filter, search]);

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user.name || 'User'}>
      <PageHeader
        title="Find a Therapist"
        description={aiSeverity
          ? `AI-ranked based on your ${aiSeverity} assessment result`
          : 'Browse system-verified mental health professionals'}
      />

      {/* AI banner */}
      {aiSeverity && (
        <div className="mb-5 flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <Brain size={16} className="text-primary flex-shrink-0" />
          <p className="text-sm text-primary">
            Therapists are ranked by AI based on your <span className="font-semibold capitalize">{aiSeverity}</span> assessment result.
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SPECIALIZATIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : therapists.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No verified therapists found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">{therapists.length} verified therapist{therapists.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {therapists.map(t => (
              <TherapistCard
                key={t._id}
                t={t}
                aiMatchScore={aiScores[String(t._id)] ?? t._aiScore ?? null}
              />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
