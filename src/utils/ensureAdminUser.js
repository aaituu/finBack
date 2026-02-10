// Balgyn: ensure there is an admin user in DB based on ADMIN_EMAIL / ADMIN_PASSWORD

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { env } = require('../config/env');

async function ensureAdminUser() {
  const adminEmail = (env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = env.ADMIN_PASSWORD || '';

  if (!adminEmail || !adminPassword) return;

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
    if (existing.isBanned) {
      existing.isBanned = false;
      await existing.save();
    }
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: 'Admin',
    email: adminEmail,
    passwordHash,
    role: 'admin',
    isBanned: false
  });
}

module.exports = { ensureAdminUser };
