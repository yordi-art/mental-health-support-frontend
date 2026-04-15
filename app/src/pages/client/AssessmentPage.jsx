import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI } from '../../api';

const phq9 = [
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

const gad7 = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const options = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

export default function AssessmentPage() {
  const [type, setType] = useState('PHQ-9');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const questions = type === 'PHQ-9' ? phq9 : gad7;
  const localScore = Object.values(answers).reduce((s, v) => s + v, 0);
  const localCategory = localScore <= 4 ? 'Minimal' : localScore <= 9 ? 'Mild' : localScore <= 14 ? 'Moderate' : localScore <= 19 ? 'Moderately Severe' : 'Severe';

  const handleSubmit = async () => {
    setLoading(true);
    const answersArray = questions.map((_, i) => answers[i] ?? 0);
    try {
      const res = await clientAPI.submitAssessment({ type, answers: answersArray });
      setResult(res.data.assessment);
    } catch {
      setResult({ score: localScore, category: localCategory, type });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const score = result?.score ?? localScore;
  const category = result?.category ?? localCategory;

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary">{score}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">{type} Result: {category}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {score <= 9 ? 'Your symptoms are mild. Consider monitoring and self-care strategies.' : 'We recommend speaking with a therapist for professional support.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/client/therapists')} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">Find a Therapist</button>
            <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Retake</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-3 mb-6">
          {['PHQ-9', 'GAD-7'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${type === t ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">{type} Assessment</h2>
          <p className="text-sm text-gray-500 mb-6">Over the last 2 weeks, how often have you been bothered by the following?</p>
          <div className="space-y-5">
            {questions.map((q, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-slate-700 mb-2">{i + 1}. {q}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {options.map((o, v) => (
                    <button key={v} onClick={() => setAnswers({ ...answers, [i]: v })}
                      className={`text-xs px-2 py-2 rounded-xl border transition ${answers[i] === v ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">{Object.keys(answers).length} / {questions.length} answered</p>
            <button
              disabled={Object.keys(answers).length < questions.length || loading}
              onClick={handleSubmit}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
