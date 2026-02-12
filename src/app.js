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
app.use(
  cors({
    origin: (origin, cb) => {
      const raw = env.CORS_ORIGIN || '*';

      // Allow non-browser tools (Postman) that send no Origin
      if (!origin) return cb(null, true);

      // If '*' => reflect request origin (works with credentials)
      if (raw === '*') return cb(null, true);

      // Support comma-separated allowlist
      const allowed = raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (allowed.includes(origin)) return cb(null, true);

      return cb(new Error('CORS blocked: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Preflight
app.options('*', cors());
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
