import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Video, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists } from '../../data/sampleData';

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
const dates = ['2025-04-10', '2025-04-11', '2025-04-12', '2025-04-14', '2025-04-15'];

const steps = ['Choose Date & Time', 'Confirm Booking', 'Success'];

export default function BookingPage() {
  const { id } = useParams();
  const t = therapists.find(x => x.id === Number(id)) || therapists[0];
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-xl mx-auto">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-primary font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-teal-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            {/* Therapist mini card */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-slate-800">{t.name}</p>
                <p className="text-xs text-gray-500">{t.specialization} · ETB {t.price}/session</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1"><Calendar size={14} /> Choose a Date</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {dates.map(d => (
                  <button key={d} onClick={() => setDate(d)}
                    className={`p-2 rounded-xl border text-xs text-center transition ${date === d ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1"><Clock size={14} /> Choose a Time</p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(ts => (
                  <button key={ts} onClick={() => setTime(ts)}
                    className={`p-2 rounded-xl border text-xs transition ${time === ts ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {ts}
                  </button>
                ))}
              </div>
            </div>

            <button disabled={!date || !time} onClick={() => setStep(1)}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800">Confirm Your Booking</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Therapist', value: t.name },
                { label: 'Specialization', value: t.specialization },
                { label: 'Date', value: new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Time', value: time },
                { label: 'Session Type', value: 'Video Session' },
                { label: 'Session Fee', value: `ETB ${t.price}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-slate-700">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStep(2)} className="flex-1 bg-teal-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition">
                Confirm & Pay ETB {t.price}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Booking Confirmed!</h2>
            <p className="text-gray-500 text-sm mb-2">Your session with <strong>{t.name}</strong> is booked.</p>
            <p className="text-sm text-gray-500 mb-6">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {time}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/client/appointments')} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
                <Calendar size={15} /> View Appointments
              </button>
              <button onClick={() => navigate('/client/session')} className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                <Video size={15} /> Join Session
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
