const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const QB_HOST = process.env.QBITTORRENT_URL || 'http://localhost:8080';
const QB_USERNAME = process.env.QBITTORRENT_USER;
const QB_PASSWORD = process.env.QBITTORRENT_PASS;

async function downloadMovies(movie) {
  const { title, magnet } = movie;

  console.log(`⬇️ Downloading movies from "${title}"`);

  try {
    console.log("QB_PASSWORD" + QB_PASSWORD)
    // Login to qBittorrent
    const loginRes = await axios.post(
      `${QB_HOST}/api/v2/auth/login`,
      new URLSearchParams({
        username: QB_USERNAME,
        password: QB_PASSWORD,
      }),
      {
        withCredentials: true,
      }
    );
    console.log('✅ loginRes.status:', loginRes.status);
    console.log('✅ loginRes.headers:', loginRes.headers);
    console.log('✅ loginRes.headers["set-cookie"]:', loginRes.headers['set-cookie']);
    const cookies = loginRes.headers['set-cookie'];
    const SID = cookies?.find((cookie) => cookie.startsWith('SID='))?.split(';')[0];

    if (!SID) throw new Error('Failed to get qBittorrent SID cookie');

    const cookieHeader = SID;

    // Add torrent
    await axios.post(
      `${QB_HOST}/api/v2/torrents/add`,
      new URLSearchParams({ urls: magnet }),
      {
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log(`📥 Torrent added for "${title}"`);

    // Wait for torrent to appear
    let torrent = null;
    for (let attempt = 1; attempt <= 20; attempt++) {
      const infoRes = await axios.get(`${QB_HOST}/api/v2/torrents/info`, {
        headers: { Cookie: cookieHeader },
      });

      const allTorrents = infoRes.data;
      console.log('allTorrents: ', allTorrents)

      torrent = allTorrents.find((t) =>
        t.name.toLowerCase().includes(title.toLowerCase())
      );

      if (torrent) {
        console.log(`🔍 Found torrent: ${torrent.name}`);
        break;
      }

      console.log(`⏳ Waiting for torrent to appear... (${attempt}/20)`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!torrent) {
      throw new Error(`Torrent not found for "${title}"`);
    }

    // Wait for download to complete
    while (
      torrent.state !== 'uploading' &&
      torrent.state !== 'pausedUP' &&
      torrent.state !== 'stalledUP'
    ) {
      console.log(`⏳ Downloading "${title}": ${(torrent.progress * 100).toFixed(2)}%`);
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const infoRes = await axios.get(`${QB_HOST}/api/v2/torrents/info`, {
        headers: { Cookie: cookieHeader },
      });
      const allTorrents = infoRes.data;
      torrent = allTorrents.find((t) =>
        t.name.toLowerCase().includes(title.toLowerCase())
      );

      if (!torrent) {
        throw new Error(`Torrent disappeared for "${title}"`);
      }
    }

    console.log(`✅ Download complete: ${torrent.content_path}`);

    // ✅ FINAL FIX → RETURN detected content_path (safe)
    return torrent.content_path;
  } catch (err) {
    console.error(`❌ Error processing "${title}":`, err);
    throw err;
  }
}

module.exports = downloadMovies;