import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { clientSidebarItems } from '../../components/client/clientNav';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const [form, setForm] = useState({ name: user.name || 'Yordanos Tadesse', email: user.email || '', phone: '+251 911 000 000', gender: 'Female', dob: '1998-05-14', emergency: '' });
  const [notifs, setNotifs] = useState({ appointments: true, assessments: true, payments: true, tips: false });
  const [saved, setSaved] = useState(false);
  const f = field => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName={form.name}>
      <PageHeader title="My Profile" description="Manage your personal information and preferences" />
      <div className="max-w-2xl space-y-5">

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
              {form.name[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Camera size={12} className="text-gray-500" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{form.name}</p>
            <p className="text-xs text-gray-400">Client · MindBridge</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label><input {...f('name')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Email</label><input type="email" {...f('email')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Phone</label><input {...f('phone')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Gender</label>
              <select {...f('gender')} className={inputCls}><option>Female</option><option>Male</option><option>Other</option></select>
            </div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Date of Birth</label><input type="date" {...f('dob')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Emergency Contact</label><input {...f('emergency')} placeholder="+251 9XX XXX XXX" className={inputCls} /></div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Change Password</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Current Password</label><input type="password" placeholder="••••••••" className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">New Password</label><input type="password" placeholder="••••••••" className={inputCls} /></div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {Object.entries(notifs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <button onClick={() => setNotifs({ ...notifs, [key]: !val })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${val ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </DashboardLayout>
  );
}
