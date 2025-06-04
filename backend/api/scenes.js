const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, gpt_response, updated_at
      FROM scene_cache
      ORDER BY updated_at DESC
    `).all();

    res.json({ success: true, scenes: rows });
  } catch (err) {
    console.error('❌ Error in GET /api/scenes:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;