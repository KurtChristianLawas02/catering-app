// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inquiries', require('./routes/inquiries'));

// Catch-all: serve frontend index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Catering Service App running at http://localhost:${PORT}`);
});
