const fs = require('fs');
const path = require('path');
const { 
  getPopularScenes,
  parseGptScenes,
  findSubtitle,
  clipScene 
} = require('./utils/sceneHelpers');

async function clipMovies(moviesInput, options = {}) {
  const { maxScenes, scale, skipChatgpt } = options;

  let movies = [];

  if (Array.isArray(moviesInput)) {
    console.log('🎞️  clipMovies received movies array.');
    movies = moviesInput;
  } else if (typeof moviesInput === 'string') {
    console.log(`🎞️  clipMovies loading from file: ${moviesInput}`);
    movies = JSON.parse(fs.readFileSync(moviesInput, 'utf-8'));
  } else {
    throw new Error('Invalid movies input — must be array or path to JSON file.');
  }

  for (const movie of movies) {
    console.log(`\n🎞️  Processing "${movie.title}"...`);

    const moviePath = movie.file_path;
    if (!moviePath || !fs.existsSync(moviePath)) {
      console.log(`⚠️ Movie file not found: ${moviePath}`);
      continue;
    }

    const subtitlePath = findSubtitle(moviePath);

    const gptResponse = await getPopularScenes(movie.title, skipChatgpt);
    const gptScenes = parseGptScenes(gptResponse);

    console.log(`🎬 Found ${gptScenes.length} scenes. maxScenes: ${maxScenes} scale: ${scale}`);

    const scenesToClip = (typeof maxScenes === 'number')
      ? gptScenes.slice(0, maxScenes)
      : gptScenes;

    console.log(`🎬 Clipping ${scenesToClip.length} scenes.`);

    const safeTitle = movie.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    const outputDir = path.join('./clips', safeTitle);
    fs.mkdirSync(outputDir, { recursive: true });

    let sceneIndex = 1;
    for (const scene of scenesToClip) {
      const outputName = path.join(outputDir, `${safeTitle}_scene${sceneIndex}.mp4`);

      console.log(`🎬 Clipping scene ${sceneIndex}: ${scene.start} - ${scene.end}`);

      const startTime = Date.now();

      await clipScene({
        moviePath,
        subtitlePath,
        scene,
        outputName,
        scale
      });

      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Scene saved: ${outputName} (${durationSec} sec)`);

      sceneIndex++;
    }
  }

  console.log(`\n✅ All clipping complete.`);
}

module.exports = { clipMovies };
