import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import TherapistCard from '../../components/common/TherapistCard';
import SearchBar from '../../components/common/SearchBar';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists } from '../../data/sampleData';

const specializations = ['All', 'Anxiety & Depression', 'Trauma & PTSD', 'Stress & Burnout'];

export default function FindTherapistPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = therapists.filter(t =>
    (filter === 'All' || t.specialization === filter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader title="Find a Therapist" description="Browse system-verified mental health professionals" />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><SearchBar placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="flex gap-2 flex-wrap">
          {specializations.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(t => <TherapistCard key={t.id} t={t} />)}
      </div>
    </DashboardLayout>
  );
}
