// Resend email helper (SMTP-free)
async function sendMail({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'onboarding@resend.dev';

  if (!key) {
    console.log('[MAIL] skipped: missing RESEND_API_KEY');
    return { skipped: true };
  }

  const recipients = to || process.env.MAIL_TO;
  if (!recipients) {
    console.log('[MAIL] skipped: missing recipient (to or MAIL_TO)');
    return { skipped: true };
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(recipients) ? recipients : [recipients],
        subject,
        text
      })
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error('[MAIL] resend failed:', resp.status, data);
      return { ok: false, error: JSON.stringify(data) };
    }

    console.log('[MAIL] resend ok:', data);
    return { ok: true };
  } catch (e) {
    console.error('[MAIL] resend exception:', e);
    return { ok: false, error: String(e?.message || e) };
  }
}

module.exports = { sendMail };
