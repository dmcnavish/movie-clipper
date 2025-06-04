// clipService.js

const { clipMovies } = require('../../clipMovies');

async function clipMovie(movie, filePath, broadcast) {
  console.log(`✂️ Clipping real movie: ${movie.title} from ${filePath}`);

  // Use your real existing function:
  const movieEntry = {
    title: movie.title,
    file_path: filePath,
    params: movie.params || {}
  };

  const resultClips = await clipMovies([movieEntry]);

  console.log(`✅ Clip complete:`, resultClips);

  broadcast({ type: 'status', message: `Clipped: ${movie.title}` });

  // resultClips is an array of clip file paths
  return resultClips;
}

module.exports = { clipMovie };