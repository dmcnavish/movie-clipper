const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

async function getPopularScenes(title, skipChatgpt = false) {
  if (skipChatgpt) {
    console.log(`⚠️ Skipping ChatGPT — using static scenes.`);
    return [
      { start: '00:05:00', end: '00:07:30' },
      { start: '00:10:00', end: '00:12:00' }
    ];
  }

  console.log(`🤖 Requesting popular scenes for "${title}" from ChatGPT...`);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `
You are a movie expert. List 3-5 of the most iconic or popular scenes from the movie "${title}". 

For each scene, provide:

1️⃣ Scene name  
2️⃣ Start and end timestamps in HH:MM:SS format.

Format example:

Popular Scenes:

1. **Scene Name**
   00:01:00 - 00:03:30
   Description...

2. **Scene Name**
   00:10:00 - 00:12:00
   Description...
`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const output = response.data.choices[0].message.content;
    console.log(`✅ GPT scenes response received.`);
    return output;

  } catch (err) {
    console.error(`❌ Error from OpenAI:`, err.response ? err.response.data : err.message);
    throw err;
  }
}

function parseGptScenes(gptResponse) {
  const sceneRegex = /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})/g;

  const scenes = [];
  let match;

  while ((match = sceneRegex.exec(gptResponse)) !== null) {
    scenes.push({
      start: match[1],
      end: match[2]
    });
  }

  console.log(`✅ Parsed ${scenes.length} scenes from GPT response.`);
  return scenes;
}

function findSubtitle(moviePath) {
  const movieDir = path.dirname(moviePath);
  const movieBase = path.basename(moviePath, path.extname(moviePath));

  const possibleSubs = [
    path.join(movieDir, `${movieBase}.srt`),
    path.join(movieDir, `${movieBase}.ass`),
    path.join(movieDir, `${movieBase}.vtt`)
  ];

  for (const subPath of possibleSubs) {
    if (fs.existsSync(subPath)) {
      console.log(`✅ Subtitle found: ${subPath}`);
      return subPath;
    }
  }

  console.log(`⚠️ No subtitle found for ${moviePath}`);
  return null;
}

async function clipScene({ moviePath, subtitlePath, scene, outputName, scale }) {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(moviePath)
      .setStartTime(scene.start)
      .setDuration(calculateDuration(scene.start, scene.end))
      .output(outputName);

    if (subtitlePath) {
      command = command.outputOptions([
        `-vf subtitles=${subtitlePath.replace(/:/g, '\\:')}`
      ]);
    }

    if (scale) {
      command = command.size(scale);
    }

    command
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

function calculateDuration(start, end) {
  const [sh, sm, ss] = start.split(':').map(Number);
  const [eh, em, es] = end.split(':').map(Number);

  const startSeconds = sh * 3600 + sm * 60 + ss;
  const endSeconds = eh * 3600 + em * 60 + es;

  return endSeconds - startSeconds;
}

module.exports = {
  getPopularScenes,
  parseGptScenes,
  findSubtitle,
  clipScene
};
