const db = require('./db');
const { broadcast } = require('../websockets/statusPublisher');
const { downloadMovie } = require('./downloadService');
const { clipMovie } = require('./clipService');

async function processMovieQueue() {
  const pendingMovies = db.prepare(`
    SELECT id, title, magnet, params
    FROM movies
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `).all();

  if (pendingMovies.length === 0) {
    console.log('✅ No pending movies');
    return;
  }

  console.log(`🎬 Processing ${pendingMovies.length} pending movie(s)`);

  for (const movie of pendingMovies) {
    console.log(`🚀 Starting movie: ${movie.title}`);

    try {
      // Update status to processing
      db.prepare(`
        UPDATE movies SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(movie.id);

      broadcast({ type: 'status', message: `Processing: ${movie.title}` });

      // 🚀 Real download
      const filePath = await downloadMovie(movie, broadcast);

      broadcast({ type: 'status', message: `Downloaded: ${movie.title}` });

      // 🚀 Real clip
      const clipPaths = await clipMovie(movie, filePath, broadcast);

      broadcast({ type: 'status', message: `Clipped: ${movie.title}` });

      // Save clips to DB
      const insertClip = db.prepare(`
        INSERT INTO clips (movie_id, clip_path)
        VALUES (?, ?)
      `);

      for (const clipPath of clipPaths) {
        insertClip.run(movie.id, clipPath);
      }

      // Update status to completed
      db.prepare(`
        UPDATE movies SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(movie.id);

      broadcast({ type: 'status', message: `Completed: ${movie.title}` });

    } catch (err) {
      console.error(`❌ Error processing ${movie.title}:`, err);

      db.prepare(`
        UPDATE movies SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(movie.id);

      broadcast({ type: 'error', message: `Failed: ${movie.title}` });
    }
  }
}

module.exports = { processMovieQueue };