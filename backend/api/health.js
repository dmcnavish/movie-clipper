const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../services/db');
const { isWebSocketRunning } = require('../websockets/statusPublisher');

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
    websocket: isWebSocketRunning ? 'online' : 'offline',
    version: '1.0.0'
  });
});

module.exports = router;