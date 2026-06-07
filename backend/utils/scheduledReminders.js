// ─────────────────────────────────────────────────────────────
// scheduledReminders.js
// Place: backend/utils/scheduledReminders.js
// Cron job — auto sends reminder emails before/on expiry
// ─────────────────────────────────────────────────────────────

const Member = require('../models/Member');
const nodemailer = require('nodemailer');
const buildRenewalEmailHTML = require('./reminderEmail');

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// Days-before thresholds for auto reminders
const REMINDER_DAYS = [7, 3, 1, 0];

const sendAutoReminderEmail = async (member, daysLeft) => {
  const GYM_NAME = process.env.GYM_NAME || 'Lifetime Fitness';
  const transporter = createTransporter();

  const subjects = {
    7: `Your Gym Membership Will Expire Soon – ${GYM_NAME}`,
    3: `Only 3 Days Left on Your Membership – ${GYM_NAME}`,
    1: `Membership Expiring Tomorrow – ${GYM_NAME}`,
    0: `Your Membership Has Expired Today – ${GYM_NAME}`,
  };

  const html = buildRenewalEmailHTML(member);

  await transporter.sendMail({
    from: `"${GYM_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: member.email,
    subject: subjects[daysLeft] || `Your Membership Has Expired – Renew Today | ${GYM_NAME}`,
    html,
  });
};

// ── Main scheduler function — call this once at server start ──
const startScheduledReminders = () => {
  // Run every day at 9:00 AM
  const runCheck = async () => {
    try {
      const now = new Date();
      console.log(`[Scheduler] Running reminder check at ${now.toISOString()}`);

      const members = await Member.find({ membershipStatus: 'Active' });

      for (const member of members) {
        const expiry = new Date(member.expiryDate);
        const msLeft = expiry.getTime() - now.getTime();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

        if (REMINDER_DAYS.includes(daysLeft)) {
          sendAutoReminderEmail(member, daysLeft).catch(err =>
            console.error(`[Scheduler] Email failed for ${member.email}:`, err.message)
          );
        }
      }

      // Also mark expired members
      await Member.updateMany(
        { expiryDate: { $lt: now }, membershipStatus: 'Active' },
        { membershipStatus: 'Expired' }
      );

      console.log('[Scheduler] Reminder check complete.');
    } catch (err) {
      console.error('[Scheduler] Error during reminder check:', err.message);
    }
  };

  // Run once immediately on boot (catches missed overnight checks)
  runCheck();

  // Then run every 24 hours
  setInterval(runCheck, 24 * 60 * 60 * 1000);
};

module.exports = startScheduledReminders;