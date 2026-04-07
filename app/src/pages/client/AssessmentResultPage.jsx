import { Link } from 'react-router-dom';
import { TrendingUp, AlertCircle, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { assessmentResults } from '../../data/sampleData';

const categoryConfig = {
  'Minimal': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, desc: 'Your symptoms are minimal. Keep up your self-care routines.' },
  'Mild Depression': { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: TrendingUp, desc: 'Mild symptoms detected. Self-care and monitoring are recommended.' },
  'Mild Anxiety': { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: TrendingUp, desc: 'Mild anxiety symptoms. Mindfulness and breathing exercises can help.' },
  'Moderate Depression': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, desc: 'Moderate symptoms. Speaking with a therapist is strongly recommended.' },
  'Moderate Anxiety': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, desc: 'Moderate anxiety. A therapist can help you develop coping strategies.' },
  'Severe': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, desc: 'Significant symptoms detected. Please reach out to a professional soon.' },
};

const maxScore = { 'PHQ-9': 27, 'GAD-7': 21 };

export default function AssessmentResultPage() {
  const latest = assessmentResults[0];
  const cfg = categoryConfig[latest.category] || categoryConfig['Mild Depression'];
  const Icon = cfg.icon;
  const pct = Math.round((latest.score / maxScore[latest.type]) * 100);

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Your Assessment Result</h1>
        <p className="text-sm text-gray-500 mb-6">Here's a summary of your latest mental health check-in.</p>

        {/* Result Card */}
        <div className={`rounded-2xl border p-6 mb-5 ${cfg.bg} ${cfg.border}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm`}>
              <span className={`text-2xl font-bold ${cfg.color}`}>{latest.score}</span>
              <span className="text-xs text-gray-400">/ {maxScore[latest.type]}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{latest.type} · {latest.date}</p>
              <h2 className={`text-xl font-bold ${cfg.color}`}>{latest.category}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Icon size={14} className={cfg.color} />
                <span className="text-xs text-gray-600">{cfg.desc}</span>
              </div>
            </div>
          </div>
          {/* Score bar */}
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Score progress</span><span>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct < 40 ? 'bg-green-400' : pct < 65 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-2">What this means for you</h3>
          <p className="text-sm text-gray-600 mb-4">{latest.recommendation}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/client/therapists" className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
              Find a Therapist <ArrowRight size={15} />
            </Link>
            <Link to="/client/assessment" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
              <RotateCcw size={15} /> Retake Assessment
            </Link>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Assessment History</h3>
          <div className="space-y-3">
            {assessmentResults.map(r => {
              const c = categoryConfig[r.category] || categoryConfig['Mild Depression'];
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${c.color}`}>{r.score}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{r.type} — {r.category}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.color}`}>{r.category}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
