const fs = require('fs');
const cliProgress = require('cli-progress');
const { 
  getPopularScenes,
  parseGptScenes,
  findSubtitle,
  clipScene } = require('./utils/sceneHelpers');

const USE_MOCK = process.argv.includes('--mock');

const maxScenesArg = process.argv.find(arg => arg.startsWith('--max-scenes='));
const MAX_SCENES = maxScenesArg ? parseInt(maxScenesArg.split('=')[1], 10) : 4;

async function clipMovies(movieJsonPath) {
  console.log(`\n🎬 Clipping movies from ${movieJsonPath}`);

  const movies = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'));

  const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progress.start(movies.length, 0);

  for (const movie of movies) {
    console.log(`\nProcessing: ${movie.title}`);

    const scenesDescription = await getPopularScenes(movie.title, USE_MOCK);
    console.log(`\nPopular Scenes:\n${scenesDescription}\n`);

    const gptScenes = parseGptScenes(scenesDescription);
    console.log(`Parsed ${gptScenes.length} scenes from GPT...`);

    const subtitleInfo = await findSubtitle(movie.file_path);

    const limitedScenes = gptScenes.slice(0, MAX_SCENES);

    console.log(`Clipping up to ${limitedScenes.length} scenes (max: ${MAX_SCENES})...`);

    for (const [index, scene] of limitedScenes.entries()) {
      const outputName = `${movie.title.replace(/\s+/g, '_')}_Scene${index + 1}.mp4`;
      await clipScene(movie.file_path, scene.start, scene.end, outputName, subtitleInfo);
      console.log(`Saved clip: ${outputName}`);
    }

    progress.increment();
  }

  progress.stop();
}

module.exports = { clipMovies };