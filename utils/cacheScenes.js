const Database = require('better-sqlite3');
const path = require('path');

// DB file → lives in project root → gpt_cache.db
const db = new Database(path.resolve(__dirname, '../gpt_cache.db'));

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS scene_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE,
    gpt_response TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// --- API ---
function getCachedScenes(title) {
  const row = db.prepare('SELECT gpt_response FROM scene_cache WHERE title = ?').get(title);
  return row ? row.gpt_response : null;
}

function saveScenesToCache(title, gptResponse) {
  db.prepare(`
    INSERT INTO scene_cache (title, gpt_response, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(title) DO UPDATE SET
      gpt_response = excluded.gpt_response,
      updated_at = CURRENT_TIMESTAMP
  `).run(title, gptResponse);
}

module.exports = { getCachedScenes, saveScenesToCache };