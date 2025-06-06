// /backend/config/paths.js
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CLIPS_DIR = path.join(PROJECT_ROOT, 'clips');
const SUBTITLES_DIR = path.join(PROJECT_ROOT, 'subtitles');
const MOVIES_DIR = path.join(PROJECT_ROOT, 'movies'); // if needed

module.exports = {
  PROJECT_ROOT,
  CLIPS_DIR,
  SUBTITLES_DIR,
  MOVIES_DIR,
};