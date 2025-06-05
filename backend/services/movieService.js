const db = require('./db');
// const { wss } = require('../app');
const { broadcast } = require('../websockets/statusPublisher');

// Add movie to queue
function addMovieToQueue(title, magnet, params) {
  const stmt = db.prepare(`
    INSERT INTO movies (title, magnet, params, status)
    VALUES (?, ?, ?, 'pending')
  `);
  const info = stmt.run(title, magnet, JSON.stringify(params));
  
  const movie = { id: info.lastInsertRowid, title, magnet, params, status: 'pending' };

  // Notify via WebSocket
  // broadcastStatus({ type: 'new_movie', movie });
  broadcast({ type: 'status', message: `Processing new movie ${movie}` });

  return movie;
}

// List all movies
function getAllMovies() {
  const rows = db.prepare(`
    SELECT id, title, magnet, params, status, created_at, updated_at
    FROM movies
    ORDER BY created_at DESC
  `).all();

  // Parse params back to object
  return rows.map(row => ({
    ...row,
    params: JSON.parse(row.params || '{}')
  }));
}

// // WebSocket broadcast helper
// function broadcastStatus(payload) {
//   wss.clients.forEach(client => {
//     if (client.readyState === 1) {
//       client.send(JSON.stringify(payload));
//     }
//   });
// }

module.exports = {
  addMovieToQueue,
  getAllMovies
};