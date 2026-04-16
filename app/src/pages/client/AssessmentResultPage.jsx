import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';
import { clientAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const categoryColor = {
  'Minimal': 'text-green-600 bg-green-50',
  'Mild': 'text-yellow-600 bg-yellow-50',
  'Moderate': 'text-orange-600 bg-orange-50',
  'Moderately Severe': 'text-red-500 bg-red-50',
  'Severe': 'text-red-700 bg-red-100',
};

const categoryIcon = {
  'Minimal': CheckCircle,
  'Mild': Info,
  'Moderate': AlertCircle,
  'Moderately Severe': AlertCircle,
  'Severe': AlertCircle,
};

export default function AssessmentResultPage() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientAPI.getAssessmentResults()
      .then(res => setResults(res.data?.assessments || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={user?.name || ''}>
      <PageHeader title="My Assessment Results" description="Your mental health screening history and insights" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No assessments taken yet.</p>
          <Link to="/client/assessment" className="mt-3 inline-block text-xs bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">Take Assessment</Link>
        </div>
      ) : (
        <div className="space-y-5 max-w-3xl">
          {results.map(r => {
            const Icon = categoryIcon[r.category] || Info;
            const colorCls = categoryColor[r.category] || 'text-gray-600 bg-gray-50';
            const maxScore = r.type === 'PHQ-9' ? 27 : 21;
            return (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${colorCls}`}>
                    <span className="text-2xl font-bold">{r.score}</span>
                    <span className="text-xs">/ {maxScore}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{r.type}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorCls}`}>{r.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Taken on {r.date || new Date(r.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{r.recommendation}</p>
                  </div>
                  <Icon size={20} className={colorCls.split(' ')[0]} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to="/client/therapists" className="text-xs bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">Find Therapist</Link>
                  <Link to="/client/assessment" className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition">Retake Assessment</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
