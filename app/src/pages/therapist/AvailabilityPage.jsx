import { useState } from 'react';
import { Clock, Save, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

const defaultSchedule = days.reduce((acc, d) => ({
  ...acc,
  [d]: { enabled: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(d), start: '9:00 AM', end: '5:00 PM' }
}), {});

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [saved, setSaved] = useState(false);

  const toggle = (day) => setSchedule({ ...schedule, [day]: { ...schedule[day], enabled: !schedule[day].enabled } });
  const update = (day, field, val) => setSchedule({ ...schedule, [day]: { ...schedule[day], [field]: val } });
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const selectCls = 'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <PageHeader title="Manage Availability" description="Set your weekly schedule for client bookings" />

      <div className="max-w-2xl space-y-3">
        {days.map(day => (
          <div key={day} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition ${schedule[day].enabled ? 'border-gray-100 shadow-sm' : 'border-gray-100 opacity-60'}`}>
            <button onClick={() => toggle(day)}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${schedule[day].enabled ? 'bg-primary' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${schedule[day].enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="w-24 text-sm font-medium text-slate-700">{day}</span>
            {schedule[day].enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <select value={schedule[day].start} onChange={e => update(day, 'start', e.target.value)} className={selectCls}>
                  {timeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
                <span className="text-gray-400 text-sm">to</span>
                <select value={schedule[day].end} onChange={e => update(day, 'end', e.target.value)} className={selectCls}>
                  {timeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-400 flex-1">Day off</span>
            )}
          </div>
        ))}

        <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition mt-2">
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Schedule</>}
        </button>
      </div>
    </DashboardLayout>
  );
}
