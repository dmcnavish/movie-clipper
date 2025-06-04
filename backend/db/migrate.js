const db = require('../services/db');

console.log('🚀 Running DB migrations...');

// Add movies table
db.prepare(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    magnet TEXT NOT NULL,
    params TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

console.log('✅ movies table ready');

// Add clips table
db.prepare(`
  CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    clip_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
)
`).run();

console.log('✅ clips table ready');

console.log('🎉 Migrations complete');