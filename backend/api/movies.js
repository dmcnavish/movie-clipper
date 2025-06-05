const express = require('express');
const router = express.Router();

const { addMovieToQueue, getAllMovies } = require('../services/movieService');
const { processMovieQueue } = require('../services/processMovieQueue');

// POST /api/movies → Add new movie to queue → start processing
router.post('/', async (req, res) => {
  try {
    const { title, magnet, params } = req.body;
    const movie = await addMovieToQueue(title, magnet, params);

    // 🚀 Start processing in background (don't block response)
    processMovieQueue();

    res.json({ success: true, movie });
  } catch (err) {
    console.error('❌ Error in POST /api/movies:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies → List all movies
router.get('/', async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json({ success: true, movies });
  } catch (err) {
    console.error('❌ Error in GET /api/movies:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;