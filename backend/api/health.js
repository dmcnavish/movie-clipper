const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../services/dbService');

const router = express.Router();

router.get('/', (req, res) => {
  let dbStatus = 'unknown';

  try {
    db.prepare('SELECT 1').get();
    dbStatus = 'online';
  } catch (err) {
    dbStatus = 'error';
  }

  const clipsPath = path.join(__dirname, '../../clips');
  const clipsExists = fs.existsSync(clipsPath);

  res.json({
    api: 'online',
    db: dbStatus,
    clipsFolder: clipsExists ? 'exists' : 'missing',
    websocket: 'online (check StatusBar to verify live)',
    version: '1.0.0'
  });
});

module.exports = router;