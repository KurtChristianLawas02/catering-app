// backend/routes/inquiries.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/inquiryController');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../frontend/public/uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Public route - customer submits inquiry
router.post('/', upload.single('inspiration_image'), ctrl.create);

// Admin-protected routes
router.get('/stats', auth, ctrl.getStats);
router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getOne);
router.put('/:id', auth, ctrl.update);
router.patch('/:id/status', auth, ctrl.updateStatus);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
