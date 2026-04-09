import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, Clock, Globe, Award, Calendar } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists } from '../../data/sampleData';

export default function TherapistProfilePage() {
  const { id } = useParams();
  const t = therapists.find(th => th.id === Number(id)) || therapists[0];

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 flex flex-col sm:flex-row gap-5 items-start">
          <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-2xl object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{t.name}</h1>
              {t.verified && <span className="flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Verified</span>}
            </div>
            <p className="text-gray-500 text-sm mb-2">{t.specialization}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-yellow-400" />{t.rating} ({t.reviews} reviews)</span>
              <span className="flex items-center gap-1"><Clock size={12} />{t.experience} yrs experience</span>
              <span className="flex items-center gap-1"><Award size={12} />{t.authority}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {t.languages?.map(l => <span key={l} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={9} />{l}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold text-slate-800">ETB {t.price}<span className="text-xs font-normal text-gray-400">/session</span></p>
            <Link to={`/client/book/${t.id}`} className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition text-sm text-center">Book Session</Link>
            <span className={`text-xs px-2 py-1 rounded-full text-center font-medium ${t.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {t.available ? '● Available' : '● Unavailable'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{t.bio}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Areas of Focus</h2>
              <div className="flex flex-wrap gap-2">
                {t.areas?.map(a => <span key={a} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full">{a}</span>)}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Client Reviews</h2>
              <div className="space-y-4">
                {[{ name: 'Yordanos T.', text: 'Very understanding and professional. I felt heard for the first time.', rating: 5 },
                  { name: 'Selam G.', text: 'The CBT techniques she shared were incredibly helpful.', rating: 5 }].map((r, i) => (
                  <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{r.name}</span>
                      <span className="text-xs text-yellow-500">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-500">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={15} className="text-primary" /> Availability</h2>
              <div className="space-y-1.5 text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                  <div key={d} className="flex justify-between">
                    <span className="text-gray-500">{d}</span>
                    <span className={i % 3 === 0 ? 'text-gray-400' : 'text-green-600 font-medium'}>{i % 3 === 0 ? 'Off' : '9AM–5PM'}</span>
                  </div>
                ))}
              </div>
              <Link to={`/client/book/${t.id}`} className="mt-4 block text-center bg-primary text-white py-2 rounded-xl text-xs font-semibold hover:bg-blue-600 transition">Book Now</Link>
            </div>
            <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4">
              <div className="flex items-center gap-2 mb-1"><CheckCircle size={15} className="text-teal-600" /><span className="font-semibold text-teal-700 text-sm">System Verified</span></div>
              <p className="text-xs text-teal-600">License automatically verified by our system.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
