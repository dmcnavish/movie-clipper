const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, movie_id, clip_path, created_at
      FROM clips
      ORDER BY created_at DESC
    `).all();

    res.json({ success: true, clips: rows });
  } catch (err) {
    console.error('❌ Error in GET /api/clips:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;