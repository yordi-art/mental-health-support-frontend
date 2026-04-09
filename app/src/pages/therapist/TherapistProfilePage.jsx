import { useState } from 'react';
import { Camera, Save, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function TherapistProfilePage() {
  const user = JSON.parse(localStorage.getItem('mhUser') || '{}');
  const [form, setForm] = useState({
    name: user.name || 'Dr. Sarah Mengistu', email: user.email || 'sarah@example.com',
    phone: '+251 911 000 000', specialization: 'Anxiety & Depression',
    experience: '8', workplace: 'AAU Medical Center',
    bio: 'Specializes in CBT and mindfulness-based therapy for anxiety and depression.',
  });
  const [saved, setSaved] = useState(false);
  const f = field => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName={form.name}>
      <PageHeader title="My Profile" description="Manage your professional information visible to clients" />
      <div className="max-w-2xl space-y-5">

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">{form.name[0]}</div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Camera size={12} className="text-gray-500" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{form.name}</p>
            <p className="text-xs text-gray-400">Therapist · MindBridge</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label><input {...f('name')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Email</label><input type="email" {...f('email')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Phone</label><input {...f('phone')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Specialization</label><input {...f('specialization')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Years of Experience</label><input type="number" {...f('experience')} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-gray-600 block mb-1">Workplace</label><input {...f('workplace')} className={inputCls} /></div>
          </div>
          <div className="mt-4"><label className="text-xs font-medium text-gray-600 block mb-1">Professional Bio</label>
            <textarea {...f('bio')} rows={3} className={inputCls + ' resize-none'} />
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

        <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </DashboardLayout>
  );
}
