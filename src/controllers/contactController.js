// Contact form controller (save + email via Resend API)
const ContactMessage = require('../models/ContactMessage');
const { sendMail } = require('../utils/mailer');

async function submitContact(req, res) {
  const { name = '', phone = '', email = '', message = '' } = req.body;

  const saved = await ContactMessage.create({ name, phone, email, message });

  // ✅ сразу отвечаем фронту
  res.status(201).json(saved.toJSON());

  // ✅ отправляем письмо "в фоне", не блокируем запрос
  const to = process.env.MAIL_TO || '';
  if (to) {
    const text =
      `New contact message\n\n` +
      `Name: ${name || '-'}\n` +
      `Phone: ${phone || '-'}\n` +
      `Email: ${email || '-'}\n\n` +
      `Message:\n${message}\n\n` +
      `Created: ${saved.createdAt.toISOString()}`;

    sendMail({ to, subject: 'Rentify: New Contact Request', text })
      .catch(err => console.error('[MAIL] contact failed:', err));
  } else {
    console.log('[MAIL] skipped: MAIL_TO not set');
  }
}

module.exports = { submitContact };
