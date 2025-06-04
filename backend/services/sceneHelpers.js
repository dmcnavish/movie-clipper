// sceneService.js

const db = require('./db');
const { getPopularScenes } = require('../../utils/sceneHelpers');

async function getOrFetchScenes(title, skipChatgpt = false, broadcast = () => {}) {
  // Check if cached
  const cached = db.prepare(`
    SELECT gpt_response FROM scene_cache WHERE title = ?
  `).get(title);

  if (cached && !skipChatgpt) {
    console.log(`🎭 Using cached scenes for ${title}`);
    broadcast({ type: 'status', message: `Using cached scenes for ${title}` });
    return cached.gpt_response;
  }

  // If not cached or skipChatgpt, call real GPT:
  console.log(`🤖 Fetching new scenes for ${title}`);
  broadcast({ type: 'status', message: `Fetching scenes for ${title}` });

  const gptResponse = await getPopularScenes(title);

  // Save to cache
  db.prepare(`
    INSERT OR REPLACE INTO scene_cache (title, gpt_response, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `).run(title, gptResponse);

  console.log(`✅ Scenes saved for ${title}`);

  return gptResponse;
}

module.exports = { getOrFetchScenes };