const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const brand = `
  <div style="background:#4F8EF7;padding:20px 32px;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:20px;font-family:sans-serif;">💙 MindBridge</h1>
    <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;font-family:sans-serif;">Mental Health Support Platform</p>
  </div>
`;

const footer = `
  <div style="background:#f8fafc;padding:16px 32px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:12px;margin:0;font-family:sans-serif;">
      © ${new Date().getFullYear()} MindBridge · This is an automated message, please do not reply.
    </p>
  </div>
`;

const wrap = (content) => `
  <div style="background:#f1f5f9;padding:32px 16px;font-family:sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
      ${brand}
      <div style="padding:28px 32px;">${content}</div>
      ${footer}
    </div>
  </div>
`;

const h2 = (text) => `<h2 style="color:#1e293b;font-size:18px;margin:0 0 12px;">${text}</h2>`;
const p = (text) => `<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 12px;">${text}</p>`;
const btn = (text, href) => `
  <a href="${href}" style="display:inline-block;background:#4F8EF7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-top:8px;">${text}</a>
`;
const infoBox = (rows) => `
  <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
    ${rows.map(([k, v]) => `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
        <span style="color:#64748b;font-size:13px;">${k}</span>
        <span style="color:#1e293b;font-size:13px;font-weight:600;">${v}</span>
      </div>`).join('')}
  </div>
`;

const templates = {
  welcome: ({ name }) => ({
    subject: 'Welcome to MindBridge 💙',
    html: wrap(`
      ${h2(`Welcome, ${name}! 🎉`)}
      ${p('We\'re so glad you\'re here. MindBridge is your safe space to access mental health support, connect with licensed therapists, and track your wellness journey.')}
      ${p('Here\'s what you can do:')}
      <ul style="color:#475569;font-size:14px;line-height:2;padding-left:20px;">
        <li>Take mental health assessments (PHQ-9, GAD-7)</li>
        <li>Browse and book verified therapists</li>
        <li>Attend video or in-person sessions</li>
        <li>Track your progress over time</li>
      </ul>
      ${btn('Go to Dashboard', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/dashboard`)}
    `),
  }),

  therapistVerification: ({ name, status, notes }) => ({
    subject: `Verification ${status === 'VERIFIED' ? 'Approved ✅' : 'Update'} — MindBridge`,
    html: wrap(`
      ${h2(`Verification ${status === 'VERIFIED' ? 'Approved' : 'Update'}`)}
      ${p(`Dear ${name}, your license verification has been processed.`)}
      ${infoBox([['Status', status], ['Notes', notes || 'N/A']])}
      ${status === 'VERIFIED'
        ? `${p('Congratulations! You are now fully verified and can accept client appointments.')}${btn('View Dashboard', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/therapist/dashboard`)}`
        : `${p('Please review the notes above and re-upload your credentials if needed.')}${btn('Re-upload Documents', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/therapist/verification`)}`
      }
    `),
  }),

  appointmentBooked: ({ clientName, therapistName, date, time, sessionType }) => ({
    subject: 'Appointment Confirmed — MindBridge',
    html: wrap(`
      ${h2('Your appointment is booked! 📅')}
      ${p(`Hi ${clientName}, your session has been successfully scheduled.`)}
      ${infoBox([
        ['Therapist', therapistName],
        ['Date', date],
        ['Time', time],
        ['Session Type', sessionType],
      ])}
      ${p('Please ensure you are ready 5 minutes before your session starts.')}
      ${btn('View Appointment', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/appointments`)}
    `),
  }),

  paymentConfirmation: ({ name, amount, transactionId, appointmentDate }) => ({
    subject: 'Payment Confirmed — MindBridge',
    html: wrap(`
      ${h2('Payment Successful ✅')}
      ${p(`Hi ${name}, your payment has been processed successfully.`)}
      ${infoBox([
        ['Amount', `ETB ${amount}`],
        ['Transaction ID', transactionId],
        ['Session Date', appointmentDate || 'N/A'],
        ['Status', 'Paid'],
      ])}
      ${p('Your session is now confirmed. You will receive a reminder before your appointment.')}
      ${btn('View Receipt', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/payments`)}
    `),
  }),

  sessionReminder: ({ name, therapistName, date, time, sessionType, minutesBefore }) => ({
    subject: `Session Reminder — ${minutesBefore} minutes away ⏰`,
    html: wrap(`
      ${h2(`Your session starts in ${minutesBefore} minutes! ⏰`)}
      ${p(`Hi ${name}, this is a reminder for your upcoming session.`)}
      ${infoBox([
        ['Therapist', therapistName],
        ['Date', date],
        ['Time', time],
        ['Session Type', sessionType],
      ])}
      ${p('Please make sure you are in a quiet, private space before joining.')}
      ${btn('Join Session Now', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/session`)}
    `),
  }),
};

const sendEmail = async (to, templateKey, data) => {
  if (!process.env.SMTP_USER) {
    console.log(`[Email] Skipped (no SMTP config): ${templateKey} → ${to}`);
    return;
  }
  try {
    const { subject, html } = templates[templateKey](data);
    await transporter.sendMail({ from: `"MindBridge" <${process.env.SMTP_USER}>`, to, subject, html });
    console.log(`[Email] Sent: ${templateKey} → ${to}`);
  } catch (err) {
    console.error(`[Email] Failed: ${templateKey} → ${to}:`, err.message);
  }
};

module.exports = { sendEmail };
