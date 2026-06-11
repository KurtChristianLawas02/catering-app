const db = require('../config/db');
const fs = require('fs/promises');
const path = require('path');

let tablesReady = false;

function cleanText(value, max) {
  return String(value || '').trim().slice(0, max);
}

async function ensureTables() {
  if (tablesReady) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS successful_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      caption TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS successful_event_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255),
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES successful_events(id) ON DELETE CASCADE
    )
  `);

  tablesReady = true;
}

async function getPhotosForEvents(eventIds) {
  if (!eventIds.length) return {};

  const placeholders = eventIds.map(() => '?').join(',');
  const [photos] = await db.execute(
    `SELECT * FROM successful_event_photos WHERE event_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`,
    eventIds
  );

  return photos.reduce((acc, photo) => {
    acc[photo.event_id] = acc[photo.event_id] || [];
    acc[photo.event_id].push(photo);
    return acc;
  }, {});
}

exports.getAll = async (req, res) => {
  try {
    await ensureTables();

    const [events] = await db.execute('SELECT * FROM successful_events ORDER BY created_at DESC');
    const photosByEvent = await getPhotosForEvents(events.map(eventItem => eventItem.id));

    res.json({
      data: events.map(eventItem => ({
        ...eventItem,
        photos: photosByEvent[eventItem.id] || [],
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    await ensureTables();

    const [events] = await db.execute('SELECT * FROM successful_events WHERE id = ?', [req.params.id]);
    if (!events.length) return res.status(404).json({ message: 'Post not found.' });

    const [photos] = await db.execute(
      'SELECT * FROM successful_event_photos WHERE event_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );

    res.json({ ...events[0], photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  const title = cleanText(req.body.title, 150);
  const caption = cleanText(req.body.caption, 2000);
  const files = req.files || [];

  if (!title || !caption) {
    return res.status(400).json({ message: 'Title and caption are required.' });
  }

  if (!files.length) {
    return res.status(400).json({ message: 'Please upload at least one photo.' });
  }

  try {
    await ensureTables();

    const [result] = await db.execute(
      'INSERT INTO successful_events (title, caption) VALUES (?, ?)',
      [title, caption]
    );

    const values = files.flatMap((file, index) => [
      result.insertId,
      file.filename,
      cleanText(file.originalname, 255),
      index,
    ]);
    const placeholders = files.map(() => '(?, ?, ?, ?)').join(', ');

    await db.execute(
      `INSERT INTO successful_event_photos (event_id, filename, original_name, sort_order) VALUES ${placeholders}`,
      values
    );

    res.status(201).json({ message: 'Successful event post created.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await ensureTables();

    const [photos] = await db.execute(
      'SELECT filename FROM successful_event_photos WHERE event_id = ?',
      [req.params.id]
    );

    const [result] = await db.execute('DELETE FROM successful_events WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Post not found.' });

    const uploadDir = path.join(__dirname, '../../frontend/public/uploads/successful-events');
    await Promise.allSettled(
      photos.map(photo => fs.unlink(path.join(uploadDir, path.basename(photo.filename))))
    );

    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post.' });
  }
};
