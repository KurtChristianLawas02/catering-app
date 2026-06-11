// backend/controllers/inquiryController.js
const db = require('../config/db');
const { CUSTOMER_CONFIRMATION_MESSAGE, notifyCustomerOfInquiry } = require('../services/notificationService');

const VALID_STATUSES = ['pending', 'approved', 'completed', 'cancelled'];
const VALID_EVENT_TYPES = ['wedding', 'birthday', 'corporate', 'debut', 'reunion', 'anniversary', 'other'];
const VALID_PACKAGES = ['silver', 'gold', 'aluminum', 'customize'];
const VALID_DECORATION_THEMES = ['elegant', 'rustic', 'modern', 'garden', 'tropical', 'vintage', 'minimalist'];
const VALID_FLOWER_ARRANGEMENTS = [
  'classic_roses',
  'tropical_mix',
  'wildflower',
  'orchid_luxury',
  'sunflower_garden',
  'peony_romance',
  'none',
];

function cleanText(value, max = 255) {
  return String(value || '').trim().slice(0, max);
}

function cleanOptionalText(value, max = 2000) {
  const text = cleanText(value, max);
  return text || null;
}

function isPositiveInteger(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value));
}

function isTime(value) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(String(value));
}

function validateInquiryPayload(body) {
  const payload = {
    customer_name: cleanText(body.customer_name, 120),
    customer_email: cleanText(body.customer_email, 180).toLowerCase(),
    customer_phone: cleanText(body.customer_phone, 40),
    customer_address: cleanText(body.customer_address, 255),
    event_type: cleanText(body.event_type, 40),
    event_date: cleanText(body.event_date, 10),
    event_time: cleanText(body.event_time, 8),
    event_venue: cleanText(body.event_venue, 255),
    guest_count: cleanText(body.guest_count, 6),
    special_requests: cleanOptionalText(body.special_requests),
    food_package: cleanText(body.food_package, 40),
    food_package_details: cleanOptionalText(body.food_package_details, 10000),
    decoration_theme: cleanText(body.decoration_theme, 40),
    flower_arrangement: cleanText(body.flower_arrangement, 40),
  };

  const required = [
    'customer_name',
    'customer_email',
    'customer_phone',
    'customer_address',
    'event_type',
    'event_date',
    'event_time',
    'event_venue',
    'guest_count',
    'food_package',
    'decoration_theme',
    'flower_arrangement',
  ];

  if (required.some(field => !payload[field])) {
    return { error: 'Please fill in all required fields.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer_email)) {
    return { error: 'Invalid email address.' };
  }

  if (!VALID_EVENT_TYPES.includes(payload.event_type)
    || !VALID_PACKAGES.includes(payload.food_package)
    || !VALID_DECORATION_THEMES.includes(payload.decoration_theme)
    || !VALID_FLOWER_ARRANGEMENTS.includes(payload.flower_arrangement)) {
    return { error: 'Invalid form selection.' };
  }

  if (!isPositiveInteger(payload.guest_count)) {
    return { error: 'Guest count must be a positive number.' };
  }

  if (!isIsoDate(payload.event_date) || !isTime(payload.event_time)) {
    return { error: 'Invalid event date or time.' };
  }

  return { payload: { ...payload, guest_count: Number(payload.guest_count) } };
}

// POST /api/inquiries - Customer submits a booking inquiry
exports.create = async (req, res) => {
  const { payload, error } = validateInquiryPayload(req.body);
  if (error) return res.status(400).json({ message: error });
  const inspiration_image = req.file ? req.file.filename : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO inquiries 
        (customer_name, customer_email, customer_phone, customer_address,
         event_type, event_date, event_time, event_venue, guest_count, special_requests,
         food_package, food_package_details, decoration_theme, flower_arrangement, inspiration_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [payload.customer_name, payload.customer_email, payload.customer_phone, payload.customer_address,
       payload.event_type, payload.event_date, payload.event_time, payload.event_venue, payload.guest_count,
       payload.special_requests, payload.food_package, payload.food_package_details, payload.decoration_theme,
       payload.flower_arrangement, inspiration_image]
    );

    notifyCustomerOfInquiry({
      ...payload,
      inquiry_id: result.insertId,
    }).catch(err => {
      console.error('Customer notification failed:', err.message);
    });

    res.status(201).json({
      message: `Your inquiry has been submitted successfully! ${CUSTOMER_CONFIRMATION_MESSAGE}`,
      inquiry_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit inquiry. Please try again.' });
  }
};

// GET /api/inquiries - Admin gets all inquiries
exports.getAll = async (req, res) => {
  const status = cleanText(req.query.status, 20);
  const search = cleanText(req.query.search, 100);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM inquiries WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM inquiries WHERE 1=1';
  const params = [];
  const countParams = [];

  if (status && status !== 'all') {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }

  if (search) {
    query += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR event_type LIKE ?)';
    countQuery += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR event_type LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
    countParams.push(s, s, s);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [rows] = await db.execute(query, params);
    const [[{ total }]] = await db.execute(countQuery, countParams);
    res.json({ data: rows, total, page, limit });
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

// GET /api/inquiries/approved-events - Public calendar data for approved/completed bookings
exports.getApprovedEvents = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        event_type,
        event_date,
        event_time,
        event_venue,
        guest_count,
        food_package,
        status
      FROM inquiries
      WHERE status IN ('approved', 'completed')
      ORDER BY event_date ASC, event_time ASC
    `);

    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/inquiries/calendar - Admin calendar data
exports.getCalendarEvents = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        customer_name,
        customer_email,
        customer_phone,
        event_type,
        event_date,
        event_time,
        event_venue,
        guest_count,
        food_package,
        status,
        created_at
      FROM inquiries
      WHERE status IN ('approved', 'completed')
      ORDER BY event_date ASC, event_time ASC
    `);

    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/inquiries/:id/status - Admin updates status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status))
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
  const { payload, error } = validateInquiryPayload(req.body);
  const status = cleanText(req.body.status, 20);

  if (error) return res.status(400).json({ message: error });
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status value.' });

  try {
    const [result] = await db.execute(
      `UPDATE inquiries SET
        customer_name=?, customer_email=?, customer_phone=?, customer_address=?,
        event_type=?, event_date=?, event_time=?, event_venue=?, guest_count=?, special_requests=?,
        food_package=?, food_package_details=?, decoration_theme=?, flower_arrangement=?, status=?
       WHERE id=?`,
      [payload.customer_name, payload.customer_email, payload.customer_phone, payload.customer_address,
       payload.event_type, payload.event_date, payload.event_time, payload.event_venue, payload.guest_count,
       payload.special_requests, payload.food_package, payload.food_package_details, payload.decoration_theme,
       payload.flower_arrangement, status, req.params.id]
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
