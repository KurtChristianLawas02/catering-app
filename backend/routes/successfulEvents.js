const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/successfulEventController');
const { makeSafeFilename, safeId } = require('../middleware/security');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../frontend/public/uploads/successful-events');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, makeSafeFilename(file.mimetype));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 12 } });

router.get('/', ctrl.getAll);
router.get('/:id', safeId, ctrl.getOne);
router.post('/', auth, upload.array('photos', 12), ctrl.create);
router.delete('/:id', auth, safeId, ctrl.remove);

module.exports = router;
