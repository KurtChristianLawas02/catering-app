// backend/routes/inquiries.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/inquiryController');
const { createRateLimiter, makeSafeFilename, safeId } = require('../middleware/security');

const inquiryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many inquiry submissions. Please try again later.',
});

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../frontend/public/uploads')),
  filename: (req, file, cb) => {
    cb(null, makeSafeFilename(file.mimetype));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Public route - customer submits inquiry
router.post('/', inquiryLimiter, upload.single('inspiration_image'), ctrl.create);
router.get('/approved-events', ctrl.getApprovedEvents);

// Admin-protected routes
router.get('/stats', auth, ctrl.getStats);
router.get('/calendar', auth, ctrl.getCalendarEvents);
router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, safeId, ctrl.getOne);
router.put('/:id', auth, safeId, ctrl.update);
router.patch('/:id/status', auth, safeId, ctrl.updateStatus);
router.delete('/:id', auth, safeId, ctrl.remove);

module.exports = router;
