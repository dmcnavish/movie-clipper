const fs = require('fs');
const path = require('path');
const axios = require('axios');
const util = require('util');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec);

const OUTPUT_DIR = './scenes';
const NO_SUBS = process.argv.includes('--no-subs');
const scaleArg = process.argv.find(arg => arg.startsWith('--scale='));
const SCALE = scaleArg ? scaleArg.split('=')[1] : '1080:1920';

async function getPopularScenes(title, useMock = false) {
  if (useMock) {
    console.log(`[MOCK MODE] Returning static scenes for "${title}"`);

    // Example static response — feel free to edit this!
    return `
1. Invitation Sequence
00:05:00 - 00:07:30

2. Roller Coaster Introduction
00:09:00 - 00:11:45

3. Shocking Ghost Appearance
00:28:45 - 00:31:15

4. The Bloodied Walls
01:05:30 - 01:08:00
    `.trim();
  }

  const prompt = generateScenePrompt(title);

  const response = await axios.post('https://api.openai.com/v1/responses', {
    model: 'gpt-4o',
    input: prompt,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

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
  const baseName = path.basename(filePath, path.extname(filePath));

  // Check for external .srt subtitle
  const srtPath = path.join(movieDir, `${baseName}.srt`);
  if (fs.existsSync(srtPath)) {
    console.log(`✅ Found external subtitle: ${srtPath}`);
    return { type: 'external', path: srtPath };
  }

  // Check for embedded subtitle
  try {
    const { stdout } = await exec(`ffprobe -v error -select_streams s -show_entries stream=index -of csv=p=0 "${filePath}"`);
    const streamIndex = stdout.trim();
    if (streamIndex !== '') {
      console.log(`✅ Found embedded subtitle stream: ${streamIndex}`);
      return { type: 'embedded', streamIndex };
    }
  } catch (err) {
    // No embedded subs — do nothing
  }

  console.log(`⚠️ No subtitles found for ${filePath}`);
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

  await exec(command);

  const endTimestamp = Date.now();
  const durationSec = ((endTimestamp - startTimestamp) / 1000).toFixed(2);

  console.log(`[clipScene] Finished clip: ${finalOutputName} in ${durationSec} seconds\n`);
}

function generateScenePrompt(title) {
  return `
You are a movie expert.

List 3-5 of the most iconic or popular scenes from the movie "${title}". For each scene, provide:

1️⃣ The start and end timestamps in the format "HH:MM:SS - HH:MM:SS".
2️⃣ A very short scene title (1 sentence max).

Format the response like this:

Scene Title
HH:MM:SS - HH:MM:SS

Repeat for each scene. No extra commentary, just the list.
  `.trim();
}

module.exports = { getPopularScenes, parseGptScenes, findSubtitle, clipScene };