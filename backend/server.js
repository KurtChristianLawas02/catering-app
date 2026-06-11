// backend/server.js
require('./config/env').loadEnvFile();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { securityHeaders } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin, host) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const originUrl = new URL(origin);
    const hostName = String(host || '').split(':')[0];
    const sameHost = hostName && originUrl.hostname === hostName;
    const localDevHost = ['localhost', '127.0.0.1', '::1'].includes(originUrl.hostname);

    if (process.env.NODE_ENV === 'production') {
      return sameHost && origin === `https://${host}`;
    }

    return sameHost || localDevHost;
  } catch (err) {
    return false;
  }
}

// Middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors((req, cb) => {
  const origin = req.get('Origin');
  const host = req.get('Host');

  cb(null, {
    origin: isAllowedOrigin(origin, host),
  });
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/successful-events', require('./routes/successfulEvents'));

// Catch-all: serve frontend index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);

  if (err.message === 'Not allowed by CORS.') {
    return res.status(403).json({ message: 'Origin is not allowed.' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Uploaded file is too large.' });
  }

  if (err.message === 'Only image files are allowed.') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Catering Service App running at http://localhost:${PORT}`);
});
