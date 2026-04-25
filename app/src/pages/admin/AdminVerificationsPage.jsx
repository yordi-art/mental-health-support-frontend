import { useState, useEffect } from 'react';
import { Eye, AlertTriangle, ShieldOff, RefreshCw, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import { adminSidebarItems } from '../../components/admin/adminNav';
import { adminAPI } from '../../api';

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getVerifications()
      .then(res => setVerifications(res.data?.verifications || res.data || []))
      .catch(() => setVerifications([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = verifications.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.profession?.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
        <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-5 transition">
          <ArrowLeft size={15} /> Back to Verifications
        </button>
        <div className="max-w-2xl space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Verification Details</h2>
              <StatusBadge status={selected.status || selected.verification?.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Therapist Name', value: selected.name },
                { label: 'Profession', value: selected.profession },
                { label: 'License Number', value: selected.licenseNumber || selected.license?.licenseNumber },
                { label: 'Issuing Authority', value: selected.authority || selected.license?.issuingAuthority },
                { label: 'Expiry Date', value: selected.expiry || selected.license?.licenseExpiryDate?.slice(0, 10) },
                { label: 'Submitted', value: selected.submitted || selected.createdAt?.slice(0, 10) },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                  <p className="font-medium text-slate-700">{row.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {selected.confidence != null && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-3">System Confidence Score</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${selected.confidence >= 80 ? 'bg-teal-500' : selected.confidence >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${selected.confidence}%` }} />
                </div>
                <span className="font-bold text-slate-700">{selected.confidence}%</span>
              </div>
            </div>
          )}

          {selected.flagReason && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <p className="text-sm font-medium text-orange-700 mb-1 flex items-center gap-2"><AlertTriangle size={15} /> Flag Reason</p>
              <p className="text-sm text-orange-600">{selected.flagReason}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => adminAPI.flagVerification(selected._id || selected.id, 'Manual flag')}
              className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-200 transition">
              <AlertTriangle size={15} /> Flag Account
            </button>
            <button onClick={() => adminAPI.suspendTherapist(selected._id || selected.id)}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-200 transition">
              <ShieldOff size={15} /> Suspend Account
            </button>
            <button onClick={() => adminAPI.requestReupload(selected._id || selected.id)}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-200 transition">
              <RefreshCw size={15} /> Request Re-upload
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Verification Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">System-processed license verifications — monitor and handle flagged cases</p>
        </div>
        <div className="w-56"><SearchBar placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Therapist', 'Profession', 'Status', 'Confidence', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">No verifications found.</td></tr>
              ) : filtered.map(v => (
                <tr key={v._id || v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-700">{v.name}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{v.profession || 'Therapist'}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status || v.verification?.status} /></td>
                  <td className="px-4 py-3">
                    {v.confidence != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.confidence >= 80 ? 'bg-teal-500' : v.confidence >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${v.confidence}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{v.confidence}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-400 animate-pulse">Processing...</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.submitted || v.createdAt?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(v)} title="View Details" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                      <button onClick={() => adminAPI.flagVerification(v._id || v.id, 'Manual flag')} title="Flag" className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition"><AlertTriangle size={14} /></button>
                      <button onClick={() => adminAPI.suspendTherapist(v._id || v.id)} title="Suspend" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><ShieldOff size={14} /></button>
                      <button onClick={() => adminAPI.requestReupload(v._id || v.id)} title="Request Re-upload" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"><RefreshCw size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
