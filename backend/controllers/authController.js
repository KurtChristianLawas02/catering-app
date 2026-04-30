// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'catering_secret_key_2024';

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  try {
    const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, full_name: admin.full_name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, admin: { id: admin.id, username: admin.username, full_name: admin.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
