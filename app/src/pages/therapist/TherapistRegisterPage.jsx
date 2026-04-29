import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Upload, CheckCircle, XCircle, AlertTriangle, Clock, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { therapistAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

// ── constants ────────────────────────────────────────────────────────────────

const STEPS = ['Basic Info', 'Professional', 'Education', 'License'];

const inputCls = 'w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition';
const labelCls = 'text-xs font-semibold text-gray-600 block mb-1.5';
const errCls   = 'text-xs text-red-500 mt-1';

// ── per-step validation ───────────────────────────────────────────────────────

function validateStep(step, form) {
  const errs = {};
  if (step === 0) {
    if (!form.fullName.trim())       errs.fullName  = 'Full name is required';
    if (!form.email.trim())          errs.email     = 'Email is required';
    if (form.password.length < 8)    errs.password  = 'Password must be at least 8 characters';
    if (!form.phone.trim())          errs.phone     = 'Phone number is required';
    if (!form.gender)                errs.gender    = 'Please select your gender';
    if (!form.dob)                   errs.dob       = 'Date of birth is required';
  }
  if (step === 1) {
    if (!form.specialization.trim()) errs.specialization = 'At least one specialization is required';
    if (!form.experience)            errs.experience     = 'Years of experience is required';
    if (!form.workplace.trim())      errs.workplace      = 'Workplace is required';
    if (!form.bio.trim())            errs.bio            = 'Professional bio is required';
    if (!form.hourlyRate)            errs.hourlyRate     = 'Hourly rate is required';
  }
  if (step === 2) {
    if (!form.degreeType)            errs.degreeType     = 'Degree type is required';
    if (!form.field)                 errs.field          = 'Field of study is required';
    if (!form.institution.trim())    errs.institution    = 'Institution is required';
    if (!form.graduationYear)        errs.graduationYear = 'Graduation year is required';
    if (!form.hasCOC && !form.examPassed) errs.competency = 'At least one competency certification is required';
  }
  if (step === 3) {
    if (!form.licenseNumber.trim())  errs.licenseNumber  = 'License number is required';
    if (!form.issuingAuthority)      errs.issuingAuthority = 'Issuing authority is required';
    if (!form.expiryDate)            errs.expiryDate     = 'Expiry date is required';
    if (!form.licenseFile)           errs.licenseFile    = 'Please upload your license document';
  }
  return errs;
}

// ── progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, completed, onGoTo }) {
  return (
    <div className="flex items-center gap-1 mb-7">
      {STEPS.map((s, i) => {
        const done    = completed.has(i);
        const active  = i === current;
        const canClick = done && i < current;
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <button
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onGoTo(i)}
              title={canClick ? `Go back to ${s}` : undefined}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                ${done    ? 'bg-[#2CB1A1] text-white ' + (canClick ? 'cursor-pointer hover:opacity-80 ring-2 ring-[#2CB1A1]/30' : '') :
                  active  ? 'bg-primary text-white shadow-sm' :
                            'bg-gray-100 text-gray-400 cursor-default'}`}>
              {done ? <CheckCircle size={13} /> : i + 1}
            </button>
            <span className={`text-xs font-medium hidden sm:block transition-colors
              ${active ? 'text-primary' : done ? 'text-[#2CB1A1]' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${done ? 'bg-[#2CB1A1]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── result screen ─────────────────────────────────────────────────────────────

function VerificationResult({ status, navigate }) {
  const configs = {
    VERIFIED: {
      icon: CheckCircle, color: 'text-[#2CB1A1]', bg: 'bg-teal-50 border-teal-100',
      title: 'Verification Successful!',
      desc: 'Your license has been verified. Redirecting to your dashboard…',
      btnLabel: null,   // auto-redirect, no button needed
    },
    REJECTED: {
      icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-100',
      title: 'Verification Failed',
      desc: 'We could not verify your license. Please re-upload a valid document from your dashboard.',
      btnLabel: 'Go to Dashboard',
    },
    PENDING: {
      icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100',
      title: 'Under Review',
      desc: 'Your submission is being reviewed by our team. You will be notified once complete.',
      btnLabel: 'Go to Dashboard',
    },
    EXPIRED: {
      icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100',
      title: 'License Expired',
      desc: 'Your license appears to be expired. Please renew it and re-upload from your dashboard.',
      btnLabel: 'Go to Dashboard',
    },
  };
  const c = configs[status] || configs.PENDING;
  return (
    <div className={`text-center py-10 rounded-2xl border p-8 ${c.bg}`}>
      <c.icon size={52} className={`${c.color} mx-auto mb-4`} />
      <h3 className="font-bold text-xl text-slate-800 mb-2">{c.title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">{c.desc}</p>
      {c.btnLabel && (
        <button
          onClick={() => navigate('/therapist/dashboard')}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition shadow-sm">
          {c.btnLabel} →
        </button>
      )}
      {!c.btnLabel && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#2CB1A1] font-medium">
          <Loader2 size={16} className="animate-spin" /> Redirecting…
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TherapistRegisterPage() {
  const navigate = useNavigate();
  const { setUser, setVerification } = useAuth();
  const basic = JSON.parse(sessionStorage.getItem('therapistBasic') || '{}');

  const [step, setStep]           = useState(0);
  const [completed, setCompleted] = useState(new Set());   // steps that passed validation
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult]           = useState(null);

  const [form, setForm] = useState({
    fullName: basic.name || '', email: basic.email || '', password: basic.password || '',
    phone: '', gender: '', dob: '',
    specialization: '', experience: '', workplace: '', bio: '', hourlyRate: '',
    degreeType: '', field: '', institution: '', graduationYear: '',
    hasCOC: false, examPassed: false,
    licenseNumber: '', issuingAuthority: '', issueDate: '', expiryDate: '', licenseFile: null,
  });

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    // clear the error for this field as soon as user edits it
    if (fieldErrors[field]) setFieldErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  const f = field => ({
    value: form[field],
    onChange: e => set(field, e.target.value),
  });

  // ── navigation ──────────────────────────────────────────────────────────────

  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setCompleted(prev => new Set([...prev, step]));
    setStep(s => s + 1);
  };

  const goBack = () => {
    setFieldErrors({});
    setStep(s => s - 1);
  };

  const goTo = (i) => {
    setFieldErrors({});
    setStep(i);
  };

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errs = validateStep(3, form);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('name',        form.fullName);
      fd.append('email',       form.email);
      fd.append('password',    form.password);
      fd.append('phone',       form.phone);
      fd.append('gender',      form.gender);
      fd.append('dateOfBirth', form.dob);
      fd.append('therapistData', JSON.stringify({
        specialization:  form.specialization.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(form.experience) || 0,
        bio:             form.bio,
        workplace:       form.workplace,
        hourlyRate:      Number(form.hourlyRate) || 500,
        education: {
          degreeType:     form.degreeType,
          field:          form.field,
          institution:    form.institution,
          graduationYear: Number(form.graduationYear) || new Date().getFullYear(),
        },
        license: {
          licenseNumber:     form.licenseNumber,
          issuingAuthority:  form.issuingAuthority,
          licenseExpiryDate: form.expiryDate,
          licenseDocument:   form.licenseFile ? form.licenseFile.name : '',
        },
        competency: { hasCOC: form.hasCOC, examPassed: form.examPassed },
      }));
      if (form.licenseFile) fd.append('licenseDocument', form.licenseFile);

      const res = await therapistAPI.register(fd);
      const { token, user, verification } = res.data;
      const stored = { ...user, token };
      localStorage.setItem('mhUser', JSON.stringify(stored));
      setUser(stored);
      const verStatus = verification?.status || 'PENDING';
      setVerification(verStatus);
      sessionStorage.removeItem('therapistBasic');
      setResult(verStatus);
      // Only VERIFIED redirects automatically — others stay on result screen
      if (verStatus === 'VERIFIED') {
        setTimeout(() => navigate('/therapist/dashboard'), 1500);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── field error helper ──────────────────────────────────────────────────────

  const Err = ({ k }) => fieldErrors[k]
    ? <p className={errCls}>{fieldErrors[k]}</p>
    : null;

  const fieldCls = k => inputCls + (fieldErrors[k] ? ' border-red-300 focus:ring-red-200' : '');

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brand-gradient flex items-start justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 font-bold text-2xl text-white mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart size={18} className="fill-white text-white" />
            </div>
            MindBridge
          </div>
          <h1 className="text-2xl font-bold text-white">Therapist Registration</h1>
          <p className="text-white/70 text-sm mt-1">Complete your profile and get system-verified</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {result ? (
            <VerificationResult status={result} navigate={navigate} />
          ) : (
            <>
              <ProgressBar current={step} completed={completed} onGoTo={goTo} />

              {/* Requirements notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-xs text-blue-800 space-y-1">
                <p className="font-semibold text-sm text-primary mb-1.5">Requirements for VERIFIED status</p>
                <p>• Education: <strong>Psychology, Clinical Psychology, or Social Work</strong></p>
                <p>• Authority: <strong>Ministry of Health</strong> or <strong>Regional Health Bureau</strong></p>
                <p>• License must <strong>not be expired</strong> · Document must be <strong>uploaded</strong></p>
                <p>• Must have <strong>COC certificate</strong> OR <strong>passed licensing exam</strong></p>
              </div>

              {/* ── Step 0 — Basic Info ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700 mb-3">Basic Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                      <input {...f('fullName')} placeholder="Dr. Sarah Mengistu" className={fieldCls('fullName')} />
                      <Err k="fullName" />
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                      <input type="email" {...f('email')} placeholder="dr@example.com" className={fieldCls('email')} />
                      <Err k="email" />
                    </div>
                    <div>
                      <label className={labelCls}>Password <span className="text-red-400">*</span></label>
                      <input type="password" {...f('password')} placeholder="Min. 8 characters" className={fieldCls('password')} />
                      <Err k="password" />
                    </div>
                    <div>
                      <label className={labelCls}>Phone <span className="text-red-400">*</span></label>
                      <input {...f('phone')} placeholder="+251 9XX XXX XXX" className={fieldCls('phone')} />
                      <Err k="phone" />
                    </div>
                    <div>
                      <label className={labelCls}>Gender <span className="text-red-400">*</span></label>
                      <select {...f('gender')} className={fieldCls('gender')}>
                        <option value="">Select gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                      <Err k="gender" />
                    </div>
                    <div>
                      <label className={labelCls}>Date of Birth <span className="text-red-400">*</span></label>
                      <input type="date" {...f('dob')} className={fieldCls('dob')} />
                      <Err k="dob" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1 — Professional ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700 mb-3">Professional Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Specialization <span className="text-red-400">*</span> <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                      <input {...f('specialization')} placeholder="Anxiety & Depression, Trauma, PTSD" className={fieldCls('specialization')} />
                      <Err k="specialization" />
                    </div>
                    <div>
                      <label className={labelCls}>Years of Experience <span className="text-red-400">*</span></label>
                      <input type="number" min="0" {...f('experience')} placeholder="5" className={fieldCls('experience')} />
                      <Err k="experience" />
                    </div>
                    <div>
                      <label className={labelCls}>Hourly Rate (ETB) <span className="text-red-400">*</span></label>
                      <input type="number" min="0" {...f('hourlyRate')} placeholder="800" className={fieldCls('hourlyRate')} />
                      <Err k="hourlyRate" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Workplace / Institution <span className="text-red-400">*</span></label>
                      <input {...f('workplace')} placeholder="AAU Medical Center" className={fieldCls('workplace')} />
                      <Err k="workplace" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Professional Bio <span className="text-red-400">*</span></label>
                    <textarea {...f('bio')} rows={3} placeholder="Brief description of your approach and expertise..." className={fieldCls('bio') + ' resize-none'} />
                    <Err k="bio" />
                  </div>
                </div>
              )}

              {/* ── Step 2 — Education ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700 mb-3">Education & Competency</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Degree Type <span className="text-red-400">*</span></label>
                      <select {...f('degreeType')} className={fieldCls('degreeType')}>
                        <option value="">Select degree</option>
                        <option>Bachelor</option><option>Master</option>
                        <option>Doctorate</option><option>Diploma</option>
                      </select>
                      <Err k="degreeType" />
                    </div>
                    <div>
                      <label className={labelCls}>Field of Study <span className="text-red-400">*</span></label>
                      <select {...f('field')} className={fieldCls('field')}>
                        <option value="">Select field</option>
                        <option>Psychology</option><option>Clinical Psychology</option>
                        <option>Social Work</option><option>Counseling</option><option>Other</option>
                      </select>
                      <Err k="field" />
                    </div>
                    <div>
                      <label className={labelCls}>Institution <span className="text-red-400">*</span></label>
                      <input {...f('institution')} placeholder="Addis Ababa University" className={fieldCls('institution')} />
                      <Err k="institution" />
                    </div>
                    <div>
                      <label className={labelCls}>Graduation Year <span className="text-red-400">*</span></label>
                      <input type="number" {...f('graduationYear')} placeholder="2018" className={fieldCls('graduationYear')} />
                      <Err k="graduationYear" />
                    </div>
                  </div>

                  <div className={`bg-blue-50 border rounded-xl p-4 space-y-3 ${fieldErrors.competency ? 'border-red-300' : 'border-blue-100'}`}>
                    <p className="text-xs font-semibold text-slate-700">Competency Certification <span className="text-red-400">*</span></p>
                    {[
                      { key: 'hasCOC',     label: 'I have a COC (Certificate of Competency)' },
                      { key: 'examPassed', label: 'I have passed the licensing exam' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form[key]}
                          onChange={e => {
                            set(key, e.target.checked);
                            if (fieldErrors.competency) setFieldErrors(er => { const n = { ...er }; delete n.competency; return n; });
                          }}
                          className="w-4 h-4 accent-primary rounded" />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                    <Err k="competency" />
                  </div>
                </div>
              )}

              {/* ── Step 3 — License ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700 mb-1">License Verification</p>
                  <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                    🔒 Your license will be automatically verified by our AI system against Ethiopian Health Authority records.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>License Number <span className="text-red-400">*</span></label>
                      <input {...f('licenseNumber')} placeholder="ETH-PSY-2024-XXXX" className={fieldCls('licenseNumber')} />
                      <Err k="licenseNumber" />
                    </div>
                    <div>
                      <label className={labelCls}>Issuing Authority <span className="text-red-400">*</span></label>
                      <select {...f('issuingAuthority')} className={fieldCls('issuingAuthority')}>
                        <option value="">Select authority</option>
                        <option value="Ministry of Health">Ministry of Health</option>
                        <option value="Regional Health Bureau">Regional Health Bureau</option>
                        <option value="Other">Other</option>
                      </select>
                      <Err k="issuingAuthority" />
                    </div>
                    <div>
                      <label className={labelCls}>Issue Date</label>
                      <input type="date" {...f('issueDate')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Expiry Date <span className="text-red-400">*</span></label>
                      <input type="date" {...f('expiryDate')} className={fieldCls('expiryDate')} />
                      <Err k="expiryDate" />
                    </div>
                  </div>

                  {/* File upload */}
                  <div>
                    <label className={labelCls}>Upload License Document <span className="text-red-400">*</span></label>
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition
                      ${fieldErrors.licenseFile ? 'border-red-300 bg-red-50' :
                        form.licenseFile        ? 'border-[#2CB1A1] bg-teal-50' :
                                                  'border-gray-200 hover:border-primary hover:bg-blue-50'}`}>
                      <Upload size={22} className={`mb-2 ${fieldErrors.licenseFile ? 'text-red-400' : form.licenseFile ? 'text-[#2CB1A1]' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${fieldErrors.licenseFile ? 'text-red-500' : form.licenseFile ? 'text-[#2CB1A1]' : 'text-gray-500'}`}>
                        {form.licenseFile ? form.licenseFile.name : 'Click to upload PDF or image'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">Max 5MB · PDF, JPG, PNG</span>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => {
                          set('licenseFile', e.target.files[0] || null);
                          if (fieldErrors.licenseFile) setFieldErrors(er => { const n = { ...er }; delete n.licenseFile; return n; });
                        }} />
                    </label>
                    <Err k="licenseFile" />
                  </div>

                  {submitError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                      {submitError}
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                {/* Back button — always shown on steps > 0 */}
                {step > 0 ? (
                  <button type="button" onClick={goBack}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    <ArrowLeft size={15} /> Back
                  </button>
                ) : <div />}

                {/* Continue / Submit */}
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={goNext}
                    className="flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition shadow-sm">
                    Continue <ArrowRight size={15} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting}
                    className="flex items-center gap-2 bg-[#2CB1A1] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#239E8F] transition disabled:opacity-60 shadow-sm">
                    {submitting ? (
                      <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    ) : (
                      <><CheckCircle size={15} /> Submit for Verification</>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-white/40 text-xs mt-5">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
