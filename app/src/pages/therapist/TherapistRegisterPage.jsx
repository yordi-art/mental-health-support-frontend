import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Upload, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { therapistAPI } from '../../api';

const steps = ['Basic Info', 'Professional Info', 'License Verification'];

function ProgressBar({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
            ${i < current ? 'bg-teal-500 text-white' : i === current ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
            {i < current ? <CheckCircle size={14} /> : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
          {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-teal-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function VerificationResult({ status, navigate }) {
  const configs = {
    VERIFIED: { icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50', title: 'Verification Successful!', desc: 'Your license has been verified. You can now access your therapist dashboard.' },
    REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', title: 'Verification Failed', desc: 'We could not verify your license. Please check your details and re-upload.' },
    PENDING:  { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', title: 'Under Verification', desc: 'Your submission is being reviewed. You will be notified once the process is complete.' },
    EXPIRED:  { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', title: 'License Expired', desc: 'Your license appears to be expired. Please renew and re-upload.' },
  };
  const c = configs[status] || configs.PENDING;

  return (
    <div className={`text-center py-10 rounded-2xl ${c.bg} p-8`}>
      <c.icon size={48} className={`${c.color} mx-auto mb-4`} />
      <h3 className="font-bold text-xl text-slate-800 mb-2">{c.title}</h3>
      <p className="text-sm text-gray-600 mb-6">{c.desc}</p>
      <button
        onClick={() => navigate('/therapist/dashboard')}
        className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function TherapistRegisterPage() {
  const navigate = useNavigate();
  const basic = JSON.parse(sessionStorage.getItem('therapistBasic') || '{}');

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: basic.name || '',
    email: basic.email || '',
    password: basic.password || '',
    phone: '', gender: '', dob: '',
    profession: 'therapist', specialization: '', experience: '', workplace: '', bio: '',
    licenseNumber: '', issuingAuthority: '', issueDate: '', expiryDate: '', licenseFile: null,
  });

  const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await therapistAPI.register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dob,
        therapistData: {
          profession: form.profession,
          specialization: [form.specialization],
          experienceYears: Number(form.experience),
          workplace: form.workplace,
          bio: form.bio,
          licenseNumber: form.licenseNumber,
          issuingAuthority: form.issuingAuthority,
          licenseIssueDate: form.issueDate,
          licenseExpiryDate: form.expiryDate,
          licenseDocument: form.licenseFile ? form.licenseFile.name : '',
        },
      });

      const { token, user, verification } = res.data;
      localStorage.setItem('mhUser', JSON.stringify({ ...user, token }));
      sessionStorage.removeItem('therapistBasic');
      setResult(verification?.status || 'PENDING');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-2">
            <Heart size={22} className="fill-primary" /> MindBridge
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Therapist Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Complete your profile and get system-verified</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {result ? (
            <VerificationResult status={result} navigate={navigate} />
          ) : (
            <>
              <ProgressBar current={step} />

              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label><input {...f('fullName')} placeholder="Dr. Sarah Mengistu" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Email</label><input type="email" {...f('email')} placeholder="dr@example.com" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Password</label><input type="password" {...f('password')} placeholder="••••••••" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Phone</label><input {...f('phone')} placeholder="+251 9XX XXX XXX" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Gender</label>
                      <select {...f('gender')} className={inputCls}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select>
                    </div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Date of Birth</label><input type="date" {...f('dob')} className={inputCls} /></div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Profession</label>
                      <select {...f('profession')} className={inputCls}><option value="therapist">Therapist</option><option value="counselor">Counselor</option></select>
                    </div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Specialization</label><input {...f('specialization')} placeholder="e.g. Anxiety & Depression" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Years of Experience</label><input type="number" {...f('experience')} placeholder="5" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Workplace / Institution</label><input {...f('workplace')} placeholder="AAU Medical Center" className={inputCls} /></div>
                  </div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Professional Bio</label>
                    <textarea {...f('bio')} rows={3} placeholder="Brief description of your approach and expertise..." className={inputCls + ' resize-none'} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 mb-1">License Verification</h3>
                  <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded-xl">
                    🔒 Your license will be automatically verified by our system. This process is secure and typically takes under 2 minutes.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">License Number</label><input {...f('licenseNumber')} placeholder="ETH-PSY-2024-XXXX" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Issuing Authority</label><input {...f('issuingAuthority')} placeholder="Ethiopian Health Authority" className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Issue Date</label><input type="date" {...f('issueDate')} className={inputCls} /></div>
                    <div><label className="text-xs font-medium text-gray-600 block mb-1">Expiry Date</label><input type="date" {...f('expiryDate')} className={inputCls} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Upload License Document</label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">{form.licenseFile ? form.licenseFile.name : 'Click to upload PDF or image'}</span>
                      <span className="text-xs text-gray-400 mt-1">Max 5MB · PDF, JPG, PNG</span>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setForm({ ...form, licenseFile: e.target.files[0] })} />
                    </label>
                  </div>
                  {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
                </div>
              )}

              <div className="flex justify-between mt-6">
                {step > 0 ? (
                  <button onClick={() => setStep(step - 1)} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">← Back</button>
                ) : <div />}
                {step < steps.length - 1 ? (
                  <button onClick={() => setStep(step + 1)} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">Continue →</button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className="bg-teal-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
