import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { therapistSidebarItems } from '../../components/therapist/therapistNav';

export default function TherapistVideoSessionPage() {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  return (
    <DashboardLayout sidebarItems={therapistSidebarItems} userName="Dr. Sarah">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Live Session</h1>
            <p className="text-sm text-gray-500">Session with Yordanos T. · 50 min</p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center mb-4">
          <div className="text-center text-white">
            <div className="w-20 h-20 rounded-full bg-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <Users size={32} className="text-white" />
            </div>
            <p className="font-semibold">Yordanos T.</p>
            <p className="text-sm text-gray-400 mt-1">Connected</p>
          </div>
          <div className="absolute bottom-4 right-4 w-28 h-20 bg-slate-700 rounded-xl flex items-center justify-center">
            <span className="text-xs text-gray-400">Dr. Sarah (You)</span>
          </div>
          <div className="absolute top-4 left-4 bg-black/40 text-white text-xs px-3 py-1 rounded-full">12:34</div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setMuted(!muted)} className={`p-4 rounded-full transition ${muted ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button onClick={() => setVideoOff(!videoOff)} className={`p-4 rounded-full transition ${videoOff ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {videoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <button className="p-4 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <MessageSquare size={20} />
          </button>
          <button className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition">
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
