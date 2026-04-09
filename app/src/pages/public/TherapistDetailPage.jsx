import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, Clock, Globe, MapPin, Award, MessageCircle } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { therapists } from '../../data/sampleData';

export default function PublicTherapistDetailPage() {
  const { id } = useParams();
  const t = therapists.find(th => th.id === Number(id)) || therapists[0];

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row gap-6 items-start">
          <img src={t.avatar} alt={t.name} className="w-24 h-24 rounded-2xl object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{t.name}</h1>
              {t.verified && (
                <span className="flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
            </div>
            <p className="text-gray-500 mb-2">{t.specialization}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" />{t.rating} ({t.reviews} reviews)</span>
              <span className="flex items-center gap-1"><Clock size={14} />{t.experience} years experience</span>
              <span className="flex items-center gap-1"><Award size={14} />{t.authority}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.languages?.map(l => (
                <span key={l} className="flex items-center gap-1 text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full"><Globe size={10} />{l}</span>
              ))}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.available ? '● Available Now' : '● Unavailable'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <p className="text-2xl font-bold text-slate-800">ETB {t.price}<span className="text-sm font-normal text-gray-400">/session</span></p>
            <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition text-sm">Book a Session</Link>
            <Link to="/register" className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition flex items-center gap-1 justify-center"><MessageCircle size={14} /> Message</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            {/* Bio */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{t.bio}</p>
            </div>

            {/* Areas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Areas of Focus</h2>
              <div className="flex flex-wrap gap-2">
                {t.areas?.map(a => (
                  <span key={a} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Client Reviews</h2>
              <div className="space-y-4">
                {[{ name: 'Yordanos T.', text: 'Very understanding and professional. I felt heard for the first time.', rating: 5 },
                  { name: 'Selam G.', text: 'The techniques she shared were incredibly helpful for my anxiety.', rating: 5 }].map((r, i) => (
                  <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
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

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Session Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Session Fee</span><span className="font-medium">ETB {t.price}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">50 minutes</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Format</span><span className="font-medium">Video Call</span></div>
              </div>
              <Link to="/register" className="mt-4 block text-center bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition text-sm">Book Now</Link>
            </div>

            <div className="bg-teal-50 rounded-2xl border border-teal-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-teal-600" />
                <span className="font-semibold text-teal-700 text-sm">System Verified</span>
              </div>
              <p className="text-xs text-teal-600">This therapist's professional license has been automatically verified by our system.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
