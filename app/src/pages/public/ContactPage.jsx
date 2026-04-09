import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const f = field => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Get in <span className="text-primary">Touch</span></h1>
        <p className="text-gray-500 max-w-md mx-auto">Have a question or need support? We're here to help. Reach out and we'll respond within 24 hours.</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Contact Info */}
        <div className="space-y-5">
          <h2 className="font-semibold text-slate-800 text-lg">Contact Information</h2>
          {[
            { icon: Mail, label: 'Email', value: 'support@mindbridge.et' },
            { icon: Phone, label: 'Phone', value: '+251 911 000 000' },
            { icon: MapPin, label: 'Address', value: 'Addis Ababa, Ethiopia' },
          ].map(c => (
            <div key={c.label} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <c.icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="text-sm font-medium text-slate-700">{c.value}</p>
              </div>
            </div>
          ))}
          <div className="bg-blue-50 rounded-2xl p-4 mt-4">
            <p className="text-sm font-medium text-slate-700 mb-1">Support Hours</p>
            <p className="text-xs text-gray-500">Monday – Friday: 8:00 AM – 6:00 PM</p>
            <p className="text-xs text-gray-500">Saturday: 9:00 AM – 2:00 PM</p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {sent ? (
            <div className="text-center py-16">
              <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-sm text-primary hover:underline">Send another message</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-5">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label><input required {...f('name')} placeholder="Yordanos Tadesse" className={inputCls} /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Email</label><input type="email" required {...f('email')} placeholder="you@example.com" className={inputCls} /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Subject</label><input required {...f('subject')} placeholder="How can we help?" className={inputCls} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Message</label>
                  <textarea required {...f('message')} rows={5} placeholder="Tell us more..." className={inputCls + ' resize-none'} />
                </div>
                <button type="submit" className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
