const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { UPLOADS_DIR } = require('./utils/helpers');

const CLIENT_DIR = path.join(__dirname, '..', 'client');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ── Security headers ────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null, // allow plain http on LAN while developing
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS (only needed when the client is hosted on another origin) ──
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));

// ── Parsers & logging ───────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── API ─────────────────────────────────────────────────────────────
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
  })
);

app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ status: 'ok', db: states[mongoose.connection.readyState] || 'unknown', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', notFound);

// ── Static files: uploads + frontend ────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', fallthrough: false }));
app.use(express.static(CLIENT_DIR, { extensions: ['html'] }));

// Unknown page → friendly 404 page
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.status(404).sendFile(path.join(CLIENT_DIR, '404.html'));
});

app.use(errorHandler);

module.exports = app;
