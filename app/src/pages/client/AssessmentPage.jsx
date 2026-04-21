import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const PHQ9 = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself',
  'Trouble concentrating on things',
  'Moving or speaking slowly (or being fidgety/restless)',
  'Thoughts that you would be better off dead',
];

const GAD7 = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const OPTIONS = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

const SEVERITY_STYLES = {
  minimal:  'text-green-600  bg-green-50  border-green-200',
  mild:     'text-yellow-600 bg-yellow-50 border-yellow-200',
  moderate: 'text-orange-600 bg-orange-50 border-orange-200',
  severe:   'text-red-600    bg-red-50    border-red-200',
};

export default function AssessmentPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [type, setType]         = useState('PHQ-9');
  const [answers, setAnswers]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);   // full AI result
  const [therapists, setTherapists] = useState([]); // AI matched therapists
  const [error, setError]       = useState(null);

  const questions = type === 'PHQ-9' ? PHQ9 : GAD7;
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleTypeChange = (t) => {
    setType(t);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // ✅ Send answers in the format the backend expects: [{score: N}, ...]
    const answersArray = questions.map((_, i) => ({ score: answers[i] ?? 0 }));

    try {
      const res = await clientAPI.submitAssessment({ type, answers: answersArray });
      setResult(res.data.assessment);
      setTherapists(res.data.recommendedTherapists || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    const severity    = result.severity || 'minimal';
    const styleClass  = SEVERITY_STYLES[severity] || SEVERITY_STYLES.minimal;
    const confidence  = result.confidence ? Math.round(result.confidence * 100) : null;

    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ── AI Score Card ── */}
          <div className={`rounded-2xl border p-6 ${styleClass}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">{type} · AI Assessment</p>
                <h2 className="text-2xl font-bold capitalize mt-0.5">{severity} Symptoms</h2>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{result.rawScore}</p>
                <p className="text-xs opacity-70">raw score</p>
              </div>
            </div>
            {confidence !== null && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>AI Confidence</span>
                  <span>{confidence}%</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div className="h-2 rounded-full bg-current opacity-70 transition-all" style={{ width: `${confidence}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── AI Interpretation ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Interpretation</p>
            <p className="text-sm font-medium text-slate-700">{result.interpretation}</p>
            <p className="text-sm text-gray-500 mt-2">{result.recommendation}</p>

            {/* Probability distribution */}
            {result.probabilityDist && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {Object.entries(result.probabilityDist).map(([label, prob]) => (
                  <div key={label} className="text-center">
                    <div className="text-xs text-gray-400 capitalize mb-1">{label}</div>
                    <div className="text-sm font-semibold text-slate-700">{Math.round(prob * 100)}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Risk Flags ── */}
          {result.riskFlags?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">⚠ Risk Flags Detected</p>
              <div className="flex flex-wrap gap-2">
                {result.riskFlags.map(f => (
                  <span key={f} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full capitalize">
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              {result.aiNote && <p className="text-sm text-red-700 font-medium mt-3">{result.aiNote}</p>}
            </div>
          )}

          {/* ── Elevated Domains ── */}
          {result.elevatedDomains && Object.keys(result.elevatedDomains).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Elevated Symptom Domains</p>
              <div className="space-y-2">
                {Object.entries(result.elevatedDomains).map(([domain, avg]) => (
                  <div key={domain} className="flex items-center gap-3">
                    <span className="text-sm capitalize text-slate-600 w-28">{domain}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(avg / 3) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{avg}/3</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI Matched Therapists ── */}
          {therapists.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                AI Recommended Therapists
              </p>
              <div className="space-y-3">
                {therapists.slice(0, 5).map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(t.name || 'T')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{t.name}</p>
                        <p className="text-xs text-gray-400">{Array.isArray(t.specialization) ? t.specialization.join(', ') : t.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-primary">Match {Math.round((t.aiMatchScore || 0) * 100)}%</p>
                      <p className="text-xs text-gray-400">★ {t.rating || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/client/therapists')}
                className="mt-4 w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
                View All Therapists
              </button>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/client/therapists')}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
              Find a Therapist
            </button>
            <button
              onClick={() => { setAnswers({}); setResult(null); setTherapists([]); }}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
              Retake Assessment
            </button>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <div className="max-w-2xl mx-auto">

        {/* Type selector */}
        <div className="flex gap-3 mb-6">
          {['PHQ-9', 'GAD-7'].map(t => (
            <button key={t} onClick={() => handleTypeChange(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${type === t ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">{type} Assessment</h2>
          <p className="text-sm text-gray-500 mb-6">Over the last 2 weeks, how often have you been bothered by the following?</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-5">
            {questions.map((q, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-slate-700 mb-2">{i + 1}. {q}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OPTIONS.map((o, v) => (
                    <button key={v} onClick={() => setAnswers({ ...answers, [i]: v })}
                      className={`text-xs px-2 py-2 rounded-xl border transition ${answers[i] === v ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">{Object.keys(answers).length} / {questions.length} answered</p>
            <button
              disabled={!allAnswered || loading}
              onClick={handleSubmit}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Analysing with AI...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
