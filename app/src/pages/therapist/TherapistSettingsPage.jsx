import { useState } from 'react';
import { Save, CheckCircle, Bell, Shield } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function TherapistSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ hourlyRate: '800', sessionDuration: '50', currency: 'ETB' });
  const [notifs, setNotifs] = useState({ newRequests: true, appointmentReminders: true, payments: true, reviews: false });
  const f = field => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Settings" description="Manage your session preferences and notification settings" />
      <div className="max-w-xl space-y-5">

        {/* Session Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Shield size={16} className="text-primary" /> Session Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Hourly Rate (ETB)</label><input type="number" {...f('hourlyRate')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Session Duration (min)</label><input type="number" {...f('sessionDuration')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Currency</label>
              <select {...f('currency')} className={inputCls}><option>ETB</option><option>USD</option></select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Bell size={16} className="text-primary" /> Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { key: 'newRequests', label: 'New Client Requests', desc: 'Get notified when a client requests a session' },
              { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Receive reminders before upcoming sessions' },
              { key: 'payments', label: 'Payment Notifications', desc: 'Get notified when a payment is received' },
              { key: 'reviews', label: 'New Reviews', desc: 'Get notified when a client leaves a review' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key] })}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${notifs[item.key] ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </DashboardLayout>
  );
}
