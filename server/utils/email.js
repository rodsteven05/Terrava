const nodemailer = require('nodemailer');

const isConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!isConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[Email] SMTP not configured; skipping email to:', to);
    return { success: false, reason: 'smtp_not_configured' };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@terrava.com';

  try {
    const info = await transport.sendMail({ from, to, subject, text, html });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
    return { success: false, reason: err.message };
  }
};

const verifyConnection = async () => {
  const transport = getTransporter();
  if (!transport) return false;
  try {
    await transport.verify();
    return true;
  } catch (err) {
    console.error('[Email] SMTP verification failed:', err.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  isConfigured,
  verifyConnection
};
