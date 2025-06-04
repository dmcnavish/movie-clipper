const Database = require('better-sqlite3');
const path = require('path');

// Connect to existing gpt_cache.db
const dbPath = path.resolve(__dirname, '../../gpt_cache.db');
const db = new Database(dbPath);

console.log(`📚 Connected to DB: ${dbPath}`);

module.exports = db;