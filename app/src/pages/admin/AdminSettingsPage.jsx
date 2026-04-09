import { useState } from 'react';
import { Save, CheckCircle, Bell, Shield, Globe, Mail } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { adminSidebarItems } from '../../components/admin/adminNav';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'MindBridge',
    supportEmail: 'support@mindbridge.et',
    supportPhone: '+251 911 000 000',
    sessionDuration: '50',
    currency: 'ETB',
    language: 'English',
  });
  const [toggles, setToggles] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoVerification: true,
    maintenanceMode: false,
  });

  const f = field => ({ value: settings[field], onChange: e => setSettings({ ...settings, [field]: e.target.value }) });
  const toggle = key => setToggles({ ...toggles, [key]: !toggles[key] });
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const sections = [
    { icon: Globe, title: 'Platform Settings', fields: [
      { label: 'Platform Name', key: 'platformName' },
      { label: 'Default Currency', key: 'currency' },
      { label: 'Default Language', key: 'language' },
      { label: 'Session Duration (min)', key: 'sessionDuration' },
    ]},
    { icon: Mail, title: 'Contact Settings', fields: [
      { label: 'Support Email', key: 'supportEmail' },
      { label: 'Support Phone', key: 'supportPhone' },
    ]},
  ];

  const toggleItems = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts for appointments and updates', icon: Bell },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS reminders to clients and therapists', icon: Bell },
    { key: 'autoVerification', label: 'Automatic License Verification', desc: 'Enable system-based credential verification', icon: Shield },
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable public access to the platform', icon: Shield },
  ];

  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userName="Admin">
      <PageHeader title="Platform Settings" description="Configure system-wide settings and preferences" />

      <div className="max-w-2xl space-y-5">
        {sections.map(s => (
          <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><s.icon size={16} className="text-primary" />{s.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {s.fields.map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{field.label}</label>
                  <input {...f(field.key)} className={inputCls} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Toggles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4">System Toggles</h2>
          <div className="space-y-4">
            {toggleItems.map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button onClick={() => toggle(item.key)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${toggles[item.key] ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
