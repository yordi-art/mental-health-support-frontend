import { Link } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { clientSidebarItems } from '../../components/client/clientNav';
import { assessmentResults } from '../../data/sampleData';

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
  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <PageHeader title="My Assessment Results" description="Your mental health screening history and insights" />

      <div className="space-y-5 max-w-3xl">
        {assessmentResults.map(r => {
          const Icon = categoryIcon[r.category] || Info;
          const colorCls = categoryColor[r.category] || 'text-gray-600 bg-gray-50';
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${colorCls}`}>
                  <span className="text-2xl font-bold">{r.score}</span>
                  <span className="text-xs">/ {r.type === 'PHQ-9' ? '27' : '21'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-800">{r.type}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorCls}`}>{r.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Taken on {r.date}</p>
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

        {/* Progress Note */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="font-semibold text-slate-800 text-sm">Your Wellness Trend</h3>
          </div>
          <p className="text-sm text-gray-600">Your PHQ-9 score improved from <strong>11 (Moderate)</strong> in February to <strong>7 (Mild)</strong> in March. Keep up the great work! 🌱</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
