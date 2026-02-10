// Ayana: Contact form controller (save + email via nodemailer)

const ContactMessage = require('../models/ContactMessage');
const { sendMail } = require('../utils/mailer');
const { env } = require('../config/env');

async function submitContact(req, res) {
  const { name = '', phone = '', email = '', message } = req.body;

  const saved = await ContactMessage.create({ name, phone, email, message });

  const to = env.SMTP_TO || env.ADMIN_EMAIL || '';
  if (to) {
    const text =
      `New contact message\n\n` +
      `Name: ${name || '-'}\n` +
      `Phone: ${phone || '-'}\n` +
      `Email: ${email || '-'}\n\n` +
      `Message:\n${message}\n\n` +
      `Created: ${saved.createdAt.toISOString()}`;

    try {
      await sendMail({ to, subject: 'Rentify: New Contact Request', text });
    } catch (e) {
      // email may fail, but we still keep message in DB
    }
  }

  return res.status(201).json(saved.toJSON());
}

module.exports = { submitContact };
