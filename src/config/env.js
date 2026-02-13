// Balgyn: environment config (dotenv + required vars)

const path = require('path');
const dotenv = require('dotenv');

// Load env from backend/.env by default
dotenv.config({ path: path.join(process.cwd(), '.env') });

function req(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),
  MONGODB_URI: req('MONGODB_URI'),
  JWT_SECRET: req('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated allowlist, or '*' to reflect any Origin.
  // Default includes localhost + your deployed Vercel frontend.
  CORS_ORIGIN:
    process.env.CORS_ORIGIN || 'http://localhost:5173,https://finfront-omega.vercel.app',

  // Admin bootstrap
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

  // Optional SMTP (advanced feature). If not provided, emails are skipped.
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  SMTP_TO: process.env.SMTP_TO || ''
};

module.exports = { env };
