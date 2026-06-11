// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'catering_secret_key_2024';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

exports.login = async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  if (username.length > 60 || password.length > 200)
    return res.status(400).json({ message: 'Invalid credentials.' });

  try {
    const [rows] = await db.execute(
      'SELECT id, username, full_name, password_hash FROM admins WHERE username = ? LIMIT 1',
      [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, full_name: admin.full_name },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '8h' }
    );

    res.json({ token, admin: { id: admin.id, username: admin.username, full_name: admin.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
