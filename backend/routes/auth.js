// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { createRateLimiter } = require('../middleware/security');

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts. Please try again later.',
});

router.post('/login', loginLimiter, login);

module.exports = router;
