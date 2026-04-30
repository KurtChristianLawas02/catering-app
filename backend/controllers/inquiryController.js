// backend/controllers/inquiryController.js
const db = require('../config/db');

// POST /api/inquiries - Customer submits a booking inquiry
exports.create = async (req, res) => {
  const {
    customer_name, customer_email, customer_phone, customer_address,
    event_type, event_date, event_time, event_venue, guest_count, special_requests,
    food_package, food_package_details, decoration_theme, flower_arrangement
  } = req.body;

  // Basic validation
  const required = [customer_name, customer_email, customer_phone, customer_address,
    event_type, event_date, event_time, event_venue, guest_count,
    food_package, decoration_theme, flower_arrangement];

  if (required.some(v => !v || String(v).trim() === ''))
    return res.status(400).json({ message: 'Please fill in all required fields.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email))
    return res.status(400).json({ message: 'Invalid email address.' });

  const inspiration_image = req.file ? req.file.filename : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO inquiries 
        (customer_name, customer_email, customer_phone, customer_address,
         event_type, event_date, event_time, event_venue, guest_count, special_requests,
         food_package, food_package_details, decoration_theme, flower_arrangement, inspiration_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_email, customer_phone, customer_address,
       event_type, event_date, event_time, event_venue, guest_count, special_requests || null,
       food_package, food_package_details || null, decoration_theme, flower_arrangement, inspiration_image]
    );

    res.status(201).json({
      message: 'Your inquiry has been submitted successfully! We will contact you within 24 hours.',
      inquiry_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit inquiry. Please try again.' });
  }
};

// GET /api/inquiries - Admin gets all inquiries
exports.getAll = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM inquiries WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR event_type LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [rows] = await db.execute(query, params);
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) as total FROM inquiries WHERE 1=1${status && status !== 'all' ? ' AND status = ?' : ''}`,
      status && status !== 'all' ? [status] : []
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/inquiries/:id - Admin gets single inquiry
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Inquiry not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/inquiries/:id/status - Admin updates status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status value.' });

  try {
    const [result] = await db.execute('UPDATE inquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Inquiry not found.' });
    res.json({ message: `Status updated to "${status}".` });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/inquiries/:id - Admin updates inquiry details
exports.update = async (req, res) => {
  const {
    customer_name, customer_email, customer_phone, customer_address,
    event_type, event_date, event_time, event_venue, guest_count, special_requests,
    food_package, food_package_details, decoration_theme, flower_arrangement, status
  } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE inquiries SET
        customer_name=?, customer_email=?, customer_phone=?, customer_address=?,
        event_type=?, event_date=?, event_time=?, event_venue=?, guest_count=?, special_requests=?,
        food_package=?, food_package_details=?, decoration_theme=?, flower_arrangement=?, status=?
       WHERE id=?`,
      [customer_name, customer_email, customer_phone, customer_address,
       event_type, event_date, event_time, event_venue, guest_count, special_requests,
       food_package, food_package_details, decoration_theme, flower_arrangement, status,
       req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Inquiry not found.' });
    res.json({ message: 'Inquiry updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/inquiries/:id - Admin deletes inquiry
exports.remove = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Inquiry not found.' });
    res.json({ message: 'Inquiry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/inquiries/stats - Admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [[counts]] = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(status='pending') as pending,
        SUM(status='approved') as approved,
        SUM(status='completed') as completed,
        SUM(status='cancelled') as cancelled
      FROM inquiries
    `);

    const [recentRows] = await db.execute(
      'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5'
    );

    const [eventTypes] = await db.execute(`
      SELECT event_type, COUNT(*) as count FROM inquiries GROUP BY event_type ORDER BY count DESC
    `);

    res.json({ counts, recent: recentRows, event_types: eventTypes });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
