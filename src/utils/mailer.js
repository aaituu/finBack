const nodemailer = require("nodemailer");
const { env } = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const missing = [];
  if (!env.SMTP_HOST) missing.push("SMTP_HOST");
  if (!env.SMTP_USER) missing.push("SMTP_USER");
  if (!env.SMTP_PASS) missing.push("SMTP_PASS");
  if (!env.SMTP_FROM) missing.push("SMTP_FROM");

  if (missing.length) {
    console.log("[MAIL] skipped, missing env:", missing.join(", "));
    return null;
  }

  const port = Number(env.SMTP_PORT || 587);

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Проверка подключения при первом создании
  transporter.verify((err, success) => {
    if (err) console.error("[MAIL] verify failed:", err);
    else console.log("[MAIL] verify ok:", success);
  });

  return transporter;
}

async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t) return { skipped: true };

  try {
    const info = await t.sendMail({ from: env.SMTP_FROM, to, subject, text });
    console.log("[MAIL] sent:", info.messageId || info.response || "ok");
    return { ok: true };
  } catch (err) {
    console.error("[MAIL] send failed:", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

module.exports = { sendMail };
