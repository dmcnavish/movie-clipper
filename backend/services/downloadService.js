const downloadMovies = require('../cli/downloadMovies');
const { broadcast } = require('../websockets/statusPublisher');

async function downloadMovie(movie, params = {}) {
  try {
    broadcast({
      type: 'status',
      message: `⬇️ Downloading "${movie.title}"...`,
    });

    const contentPath = await downloadMovies(movie);

    if (!contentPath) {
      throw new Error(`Download failed or content path not found for "${movie.title}"`);
    }

    broadcast({
      type: 'status',
      message: `✅ Download complete for "${movie.title}"`,
    });

    return contentPath;
  } catch (err) {
    console.error(`❌ Error in downloadMovie for "${movie.title}":`, err);
    broadcast({
      type: 'status',
      message: `❌ Download failed for "${movie.title}"`,
      error: err.message,
    });
    throw err; // re-throw so processMovieQueue can handle
  }
}

module.exports = { downloadMovie };