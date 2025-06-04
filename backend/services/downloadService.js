// downloadService.js

const { downloadMovies } = require('../../downloadMovies');

async function downloadMovie(movie, broadcast) {
  console.log(`⬇️ Downloading real movie: ${movie.title}`);

  // Use your real existing function:
  const moviesToDownload = [
    {
      title: movie.title,
      magnet: movie.magnet,
      file_path: '' // optional — let your logic handle it
    }
  ];

  const resultPaths = await downloadMovies(moviesToDownload);

  console.log(`✅ Download complete:`, resultPaths);

  const movieFilePath = resultPaths[0]; // Assuming first path is main movie file

  broadcast({ type: 'status', message: `Downloaded: ${movie.title}` });

  return movieFilePath;
}

module.exports = { downloadMovie };