// Balgyn: Express app setup (middleware + routes)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const { errorHandler } = require('./middleware/errorHandler');
const { env } = require('./config/env');

const app = express();

app.disable('x-powered-by');

app.use(helmet());

// --- CORS ---
// Supports:
// - CORS_ORIGIN='*'  -> reflects request Origin (works with credentials)
// - CORS_ORIGIN='https://a.vercel.app' (single origin)
// - CORS_ORIGIN='http://localhost:5173,https://a.vercel.app' (comma-separated allowlist)
const corsOptions = {
  origin: (origin, cb) => {
    const raw = env.CORS_ORIGIN || '*';

    // Allow non-browser clients (Postman, server-to-server) with no Origin header.
    if (!origin) return cb(null, true);

    // '*' means: allow any origin by reflecting it back.
    if (raw === '*') return cb(null, true);

    const allowed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// IMPORTANT: use the same options for preflight as for actual requests.
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api', requestRoutes);
app.use('/api', contactRoutes);
app.use('/api', reportRoutes);
app.use('/api', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// API only
app.use(errorHandler);

module.exports = { app };
