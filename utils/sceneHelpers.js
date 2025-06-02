// utils/sceneHelpers.js

import fs from 'fs';

// Generate prompt for ChatGPT
export function generateScenePrompt(title) {
  return `
    You are a movie expert. List 3-5 of the most iconic or popular scenes from the movie "${title}".
    For each scene, describe it in 1-2 sentences, and provide an approximate timestamp (start and end) in the format HH:MM:SS - HH:MM:SS.

    Example:
    - Opening bank heist: 00:02:10 - 00:08:45
    - Final rooftop chase: 01:32:00 - 01:38:15
  `;
}

// Parse CSV from PySceneDetect
function parseSceneCsv(sceneCsvPath) {
  const content = fs.readFileSync(sceneCsvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.includes(',')); // skip headers
  const scenes = [];

  lines.forEach(line => {
    const parts = line.split(',');
    const start = parts[3]?.trim();
    const end = parts[4]?.trim();

    if (start && end) {
      scenes.push({ start, end });
    }
  });

  return scenes;
}

// Convert HH:MM:SS to seconds (for easier matching)
function timeToSeconds(timeStr) {
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  return hh * 3600 + mm * 60 + ss;
}

// Fuzzy match: pick closest detected scene to ChatGPT estimate
export async function matchScenes(sceneCsvPath, chatGptText) {
  const detectedScenes = parseSceneCsv(sceneCsvPath);
  const gptLines = chatGptText.split('\n').filter(l => l.includes('-'));

  const matches = [];

  for (const line of gptLines) {
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})/);

    if (timeMatch) {
      const gptStart = timeToSeconds(timeMatch[1]);
      const gptEnd = timeToSeconds(timeMatch[2]);

      // Find closest scene
      let bestScene = null;
      let minDiff = Infinity;

      for (const scene of detectedScenes) {
        const sceneStart = timeToSeconds(scene.start);
        const sceneEnd = timeToSeconds(scene.end);

        const diff = Math.abs(sceneStart - gptStart) + Math.abs(sceneEnd - gptEnd);
        if (diff < minDiff) {
          minDiff = diff;
          bestScene = scene;
        }
      }

      if (bestScene) {
        matches.push(bestScene);
      }
    }
  }

  return matches;
}
