import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { clientSidebarItems } from '../../components/client/clientNav';
import { therapists } from '../../data/sampleData';

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
const dates = ['2025-04-14', '2025-04-15', '2025-04-16', '2025-04-17', '2025-04-18'];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = therapists.find(th => th.id === Number(id)) || therapists[0];
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleProceed = () => {
    navigate('/client/payment/checkout', {
      state: { therapistId: t.id, date: selectedDate, time: selectedTime }
    });
  };

  return (
    <DashboardLayout sidebarItems={clientSidebarItems} userName="Yordanos T.">
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Book a Session</h1>
        <p className="text-sm text-gray-500 mb-6">Select a date and time for your session with {t.name}</p>

        {/* Therapist Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-4">
          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{t.name}</p>
            <p className="text-xs text-gray-500">{t.specialization}</p>
          </div>
          <p className="font-bold text-slate-800">ETB {t.price}<span className="text-xs font-normal text-gray-400">/session</span></p>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Select Date</h2>
          <div className="flex gap-2 flex-wrap">
            {dates.map(d => (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedDate === d ? 'bg-primary text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                {new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Clock size={16} className="text-primary" /> Select Time</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {timeSlots.map(time => (
                <button key={time} onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-xl text-xs font-medium transition ${selectedTime === time ? 'bg-primary text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{time}</button>
              ))}
            </div>
          </div>
        )}

        {/* Summary + Proceed to Payment */}
        {selectedDate && selectedTime && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Booking Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Therapist</span><span className="font-medium">{t.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{selectedDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{selectedTime}</span></div>
              <div className="flex justify-between pt-2 border-t border-blue-100">
                <span className="font-semibold text-slate-800">Consultation Fee</span>
                <span className="font-bold text-primary">ETB {t.price}</span>
              </div>
            </div>
            <button onClick={handleProceed}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
