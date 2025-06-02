// index.js

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import cliProgress from 'cli-progress';
import { generateScenePrompt, matchScenes } from './utils/sceneHelpers.js';

const execAsync = promisify(exec);

const MOVIE_JSON = process.argv[2] || './movies.json';
const OUTPUT_DIR = './scenes';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NO_SUBS = process.argv.includes('--no-subs');
const USE_MOCK = process.argv.includes('--mock');
const maxScenesArg = process.argv.find(arg => arg.startsWith('--max-scenes='));
const MAX_SCENES = maxScenesArg ? parseInt(maxScenesArg.split('=')[1], 10) : 4;
const scaleArg = process.argv.find(arg => arg.startsWith('--scale='));
const SCALE = scaleArg ? scaleArg.split('=')[1] : '1080:1920';


if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API Key. Set OPENAI_API_KEY in environment variables.');
  process.exit(1);
}

async function getPopularScenes(title, useMock = false) {
  if (useMock) {
    console.log(`[MOCK MODE] Returning static scenes for "${title}"`);

    // Example static response — feel free to edit this!
    return `
    - Opening cemetery scene: 00:02:10 - 00:08:45
    - First zombie attack at farmhouse: 00:15:30 - 00:21:00
    - Radio broadcast in basement: 00:45:10 - 00:50:00
    - Final escape attempt: 01:20:00 - 01:26:30
    `.trim();
  }

  const prompt = generateScenePrompt(title);

  const response = await axios.post('https://api.openai.com/v1/responses', {
    model: 'gpt-4o',
    input: prompt,
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  // Parse response from /v1/responses format
  console.log('getPopularScenes response: ', JSON.stringify(response.data, null, 4));
  if (
    response.data &&
    Array.isArray(response.data.output) &&
    response.data.output.length > 0 &&
    Array.isArray(response.data.output[0].content) &&
    response.data.output[0].content.length > 0
  ) {
    return response.data.output[0].content[0].text.trim();
  } else {
    throw new Error('Unexpected response format from /v1/responses');
  }
}

// async function detectScenes(filePath) {
//   const baseName = path.basename(filePath, path.extname(filePath));
//   const outputDir = `${baseName}_Scenes`;

//   const command = `scenedetect --input "${filePath}" detect-content list-scenes --output "${outputDir}"`;
//   await execAsync(command);

//   // The actual CSV file is named: <basename>-Scenes.csv inside the output dir
//   const sceneCsvPath = path.join(outputDir, `${baseName}-Scenes.csv`);

//   console.log(`Scene CSV generated at: ${sceneCsvPath}`);

//   return sceneCsvPath;
// }

function parseGptScenes(scenesText) {
  const sceneRegex = /(\d{1,2}:\d{2}:\d{2})\s*-\s*(\d{1,2}:\d{2}:\d{2})/g;

  const scenes = [];
  let match;

  while ((match = sceneRegex.exec(scenesText)) !== null) {
    const start = match[1];
    const end = match[2];
    scenes.push({ start, end });
  }

  return scenes;
}


async function findSubtitle(filePath) {
  const movieDir = path.dirname(filePath);
  const movieBase = path.basename(filePath, path.extname(filePath));

  // Check for external SRT first
  const srtPath = path.join(movieDir, `${movieBase}.srt`);
  if (fs.existsSync(srtPath)) {
    console.log(`Found external subtitles: ${srtPath}`);
    return { type: 'external', path: srtPath };
  }

  // If MKV, try embedded subs
  if (filePath.endsWith('.mkv')) {
    console.log(`Assuming embedded subtitles (MKV)`);
    return { type: 'embedded', streamIndex: 0 }; // Could enhance to auto-detect index
  }

  console.warn('No subtitles found.');
  return null;
}

async function clipScene(filePath, startTime, endTime, outputName, subtitleInfo) {
  console.log(`\n[clipScene] Starting clip: ${outputName}`);
  const startTimestamp = Date.now();

  // Ensure output filename is unique
  let finalOutputName = outputName;
  const outputPath = path.join(OUTPUT_DIR, finalOutputName);

  if (fs.existsSync(outputPath)) {
    const timestamp = Date.now();
    finalOutputName = outputName.replace(/\.mp4$/, `_${timestamp}.mp4`);
    console.log(`[clipScene] Output file exists, using new name: ${finalOutputName}`);
  }

  let subFilter = '';

  if (!NO_SUBS && subtitleInfo) {
    if (subtitleInfo.type === 'external') {
      subFilter = `,subtitles='${subtitleInfo.path.replace(/'/g, "'\\''")}'`;
    } else if (subtitleInfo.type === 'embedded') {
      subFilter = `,subtitles='${filePath}':si=${subtitleInfo.streamIndex}`;
    }
  }

  const command = `ffmpeg -i "${filePath}" -ss ${startTime} -to ${endTime} -vf "crop=(iw/3):(ih):(iw/3):(0),scale=${SCALE}${subFilter}" -c:a copy "${OUTPUT_DIR}/${finalOutputName}"`;

  await execAsync(command);

  const endTimestamp = Date.now();
  const durationSec = ((endTimestamp - startTimestamp) / 1000).toFixed(2);

  console.log(`[clipScene] Finished clip: ${finalOutputName} in ${durationSec} seconds\n`);
}


async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const movies = JSON.parse(fs.readFileSync(MOVIE_JSON, 'utf-8'));

  const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progress.start(movies.length, 0);

  for (const movie of movies) {
    console.log(`\nProcessing: ${movie.title}`);

    // 1️⃣ Get popular scenes from ChatGPT (or mock)
    const scenesDescription = await getPopularScenes(movie.title, USE_MOCK);
    console.log(`\nPopular Scenes:\n${scenesDescription}\n`);

    // 2️⃣ Parse GPT timestamps
    const gptScenes = parseGptScenes(scenesDescription);

    console.log(`Parsed ${gptScenes.length} scenes from GPT...`);

    // 3️⃣ Detect subtitles (once per movie)
    const subtitleInfo = await findSubtitle(movie.file_path);

    // 4️⃣ Clip only up to MAX_SCENES
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


main().catch(err => {
  console.error(err);
  process.exit(1);
});
