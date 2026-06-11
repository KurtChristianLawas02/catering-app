const crypto = require('crypto');

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
}

function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const record = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (record.resetAt <= now) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    hits.set(key, record);

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({ message });
    }

    if (hits.size > 5000) {
      for (const [hitKey, hitRecord] of hits.entries()) {
        if (hitRecord.resetAt <= now) hits.delete(hitKey);
      }
    }

    next();
  };
}

function safeId(req, res, next) {
  if (!/^\d+$/.test(String(req.params.id || ''))) {
    return res.status(400).json({ message: 'Invalid record id.' });
  }

  next();
}

function makeSafeFilename(mimetype) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };

  return `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extensions[mimetype] || ''}`;
}

module.exports = {
  createRateLimiter,
  makeSafeFilename,
  safeId,
  securityHeaders,
};
