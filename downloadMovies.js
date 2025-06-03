require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const MOVIES_DIR = './movies';

const QBITTORRENT_URL = process.env.QBITTORRENT_URL || 'http://localhost:8080';
const QBITTORRENT_USER = process.env.QBITTORRENT_USER;
const QBITTORRENT_PASS = process.env.QBITTORRENT_PASS;

const axiosInstance = axios.create({
  baseURL: QBITTORRENT_URL,
  withCredentials: true
});

let sidCookie = '';

async function qbLogin() {
  console.log(`🔑 Logging in to qBittorrent at ${QBITTORRENT_URL}...`);

  const response = await axiosInstance.post(
    '/api/v2/auth/login',
    `username=${QBITTORRENT_USER}&password=${QBITTORRENT_PASS}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader && setCookieHeader.length > 0) {
    const match = setCookieHeader[0].match(/SID=([^;]+);/);
    if (match) {
      sidCookie = `SID=${match[1]}`;
      console.log(`✅ Login successful. SID=${match[1]}`);
    } else {
      throw new Error('Failed to extract SID cookie.');
    }
  } else {
    throw new Error('No Set-Cookie header found in login response.');
  }
}

async function qbTorrentsInfo() {
  const response = await axiosInstance.get('/api/v2/torrents/info', {
    headers: { Cookie: sidCookie }
  });
  return response.data;
}

async function qbTorrentsAdd(magnet, savepath) {
  await axiosInstance.post(
    '/api/v2/torrents/add',
    `urls=${encodeURIComponent(magnet)}&savepath=${encodeURIComponent(savepath)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: sidCookie
      }
    }
  );
}

function extractMagnetHash(magnet) {
  const match = magnet.match(/urn:btih:([a-fA-F0-9]+)/);
  return match ? match[1].toLowerCase() : null;
}

async function waitForTorrentComplete(magnet, movieTitle) {
  const magnetHash = extractMagnetHash(magnet);

  if (!magnetHash) {
    console.log(`❌ Could not extract hash from magnet for "${movieTitle}" — skipping.`);
    return null;
  }

  console.log(`⏳ Waiting for torrent "${movieTitle}" (hash=${magnetHash}) to appear in qBittorrent...`);

  let torrent = null;
  let retries = 0;
  const maxRetries = 10; // ~10 * 3s = ~30 seconds

  // First loop: Wait for torrent to appear
  while (retries < maxRetries) {
    const torrents = await qbTorrentsInfo();

    // Debug — show all torrent hashes:
    // torrents.forEach(t => console.log(`DEBUG: ${t.name} | hash=${t.hash}`));

    torrent = torrents.find(t => t.hash === magnetHash);

    if (torrent) {
      console.log(`✅ Torrent found for "${movieTitle}": "${torrent.name}"`);
      break;
    }

    retries++;
    console.log(`⏳ Waiting... (${retries}/${maxRetries})`);
    await sleep(3000); // Wait 3 seconds
  }

  if (!torrent) {
    console.log(`❌ Torrent did not appear for "${movieTitle}" after waiting — skipping.`);
    return null;
  }

  // Second loop: Wait for download to complete
  console.log(`⏳ Waiting for download of "${movieTitle}" to complete...`);

  let done = false;

  while (!done) {
    const torrents = await qbTorrentsInfo();
    torrent = torrents.find(t => t.hash === magnetHash);

    if (!torrent) {
      console.log(`⚠️ Torrent disappeared for "${movieTitle}" — skipping.`);
      break;
    }

    const progress = (torrent.progress * 100).toFixed(1);
    console.log(`📊 ${movieTitle}: ${progress}% [${torrent.state}]`);

    if (torrent.state === 'uploading' || torrent.state === 'stalledUP' ||  torrent.state === 'seeding' || torrent.progress === 1) {
      console.log(`✅ Download complete for "${movieTitle}"`);
      done = true;
    } else {
      await sleep(30000); // Wait 30 seconds
    }
  }

  return torrent;
}

async function downloadMovies(movieJsonPath) {
  console.log(`\n⬇️  Downloading movies from ${movieJsonPath}`);

  const movies = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'));
  const updatedMovies = [];

  await qbLogin();

  for (const movie of movies) {
    console.log(`\n🎬 Processing "${movie.title}"...`);

    const torrents = await qbTorrentsInfo();
    const alreadyAdded = torrents.some(t => t.magnet_uri === movie.magnet);

    if (!alreadyAdded) {
      await qbTorrentsAdd(movie.magnet, path.resolve(MOVIES_DIR));
      console.log(`📥 Torrent added for "${movie.title}"`);
    } else {
      console.log(`📥 Torrent already in qBittorrent for "${movie.title}"`);
    }

    const completedTorrent = await waitForTorrentComplete(movie.magnet, movie.title);

    // Determine actual file path
    let actualFilePath = completedTorrent ? completedTorrent.content_path : '';

    // If content_path is a folder → find largest media file
    if (actualFilePath && fs.existsSync(actualFilePath)) {
      const stat = fs.statSync(actualFilePath);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(actualFilePath);
        const mediaFiles = files.filter(f => f.match(/\.(mp4|mkv|avi)$/i));

        if (mediaFiles.length === 0) {
          console.log(`⚠️ No media files found in "${actualFilePath}".`);
          actualFilePath = '';
        } else {
          // Pick largest media file
          mediaFiles.sort((a, b) => {
            const aSize = fs.statSync(path.join(actualFilePath, a)).size;
            const bSize = fs.statSync(path.join(actualFilePath, b)).size;
            return bSize - aSize;
          });

          actualFilePath = path.join(actualFilePath, mediaFiles[0]);
        }
      }
    } else {
      console.log(`⚠️ content_path does not exist or could not be determined.`);
      actualFilePath = '';
    }

    console.log(`✅ Final path for "${movie.title}": ${actualFilePath}`);

    // Push updated movie object
    updatedMovies.push({
      ...movie,
      file_path: actualFilePath
    });
  }

  console.log(`\n✅ All downloads complete.`);
  return updatedMovies;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { downloadMovies };
