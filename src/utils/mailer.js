// Ayana: SMTP email helper (optional advanced feature)

const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });
  return transporter;
}

async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t) return { skipped: true };
  await t.sendMail({ from: env.SMTP_FROM, to, subject, text });
  return { ok: true };
}

module.exports = { sendMail };
