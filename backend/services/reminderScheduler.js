const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { notify } = require('./notificationService');
const { sendEmail } = require('./emailService');

const reminded = new Set(); // track sent reminders to avoid duplicates

const checkReminders = async () => {
  const now = new Date();

  // Fetch confirmed, unpaid-or-paid appointments in the next 35 minutes
  const windowEnd = new Date(now.getTime() + 35 * 60 * 1000);

  const appointments = await Appointment.find({
    status: { $in: ['confirmed', 'pending'] },
    paymentStatus: 'paid',
  }).populate('clientId', 'name email').populate({
    path: 'therapistId',
    populate: { path: 'userId', select: 'name email' },
  });

  for (const appt of appointments) {
    const apptDateTime = new Date(`${appt.date}T${appt.time}`);
    if (isNaN(apptDateTime)) continue;

    const diffMs = apptDateTime - now;
    const diffMin = diffMs / 60000;

    const key30 = `${appt._id}-30`;
    const key10 = `${appt._id}-10`;

    const clientId = appt.clientId?._id;
    const clientName = appt.clientId?.name || 'Client';
    const clientEmail = appt.clientId?.email;
    const therapistName = appt.therapistId?.userId?.name || 'Your therapist';

    // 30-minute reminder → in-app notification only
    if (diffMin > 28 && diffMin <= 32 && !reminded.has(key30)) {
      reminded.add(key30);
      if (clientId) {
        await notify(clientId, `Reminder: Your session with ${therapistName} starts in 30 minutes.`, 'appointment_reminder', appt._id);
      }
    }

    // 10-minute reminder → in-app + email
    if (diffMin > 8 && diffMin <= 12 && !reminded.has(key10)) {
      reminded.add(key10);
      if (clientId) {
        await notify(clientId, `Your session with ${therapistName} starts in 10 minutes! Get ready.`, 'appointment_reminder', appt._id);
        if (clientEmail) {
          await sendEmail(clientEmail, 'sessionReminder', {
            name: clientName,
            therapistName,
            date: appt.date,
            time: appt.time,
            sessionType: appt.sessionType || 'Online',
            minutesBefore: 10,
          });
        }
      }
    }
  }
};

const startReminderScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      await checkReminders();
    } catch (err) {
      console.error('[Scheduler] Reminder check failed:', err.message);
    }
  });
  console.log('[Scheduler] Session reminder scheduler started');
};

module.exports = { startReminderScheduler };
