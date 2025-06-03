require('dotenv').config();
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const { downloadMovies } = require('./downloadMovies');
const { clipMovies } = require('./clipMovies');


async function main() {
  const args = minimist(process.argv.slice(2));

  const action = args.action || 'all';
  const movieJsonPath = args.movies || './movies.json';
  const maxScenes = args['max-scenes'] ? parseInt(args['max-scenes'], 10) : undefined;
  const scale = args.scale || undefined;
  const skipChatgpt = args['skip-chatgpt'] || false;

  console.log(`\n🎬 Running movie-clipper with action: ${action}\n`);

  let updatedMovies = [];

  if (action === 'download-movie' || action === 'all') {
    updatedMovies = await downloadMovies(movieJsonPath);
    console.log("after download updatedMovies: ", updatedMovies)
  }

  if (action === 'clip-movie' || action === 'all') {
    let moviesToClip = [];

    if (updatedMovies && updatedMovies.length > 0) {
      console.log('🎞️  Using updated movie paths from download phase.');
      moviesToClip = updatedMovies;
    } else {
      console.log('🎞️  No updated paths — using movies.json.');
      moviesToClip = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'));
    }
    console.log("moviesToClip", moviesToClip)
    await clipMovies(moviesToClip, { maxScenes, scale, skipChatgpt });
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
