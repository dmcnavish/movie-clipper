# 🎬 movie-clipper — Project TODO

---

## ✅ Current State (as of May 2025)

- CLI tool with `--action=download-movie`, `clip-movie`, `all`
- Torrent download via qBittorrent Web API (hash-matching ✅)
- Waits for full download completion (seeding fix in progress ✅)
- Scene clipping with GPT or mock scenes
- CLI params: `--scale`, `--max-scenes`, `--skip-chatgpt`
- Subtitles optional
- Modular architecture — ready for expansion 🚀

---

## 🚀 Phase 1 — Finalize Core (Now)

- [ ] ✅ **Finish "seeding" fix in `waitForTorrentComplete()`**
- [ ] ✅ **Auto-write `movies.updated.json` after downloadMovies()**
    - Enables `npm run clip -- --movies=./movies.updated.json`
- [ ] ✅ Improve error handling:
    - [ ] GPT failure → fallback to mock scenes
    - [ ] clipScene() failure → continue to next scene
    - [ ] Subtitle missing → warn but continue
- [ ] ✅ Basic logging (optional `--logfile=logs.txt`)

---

## 🚀 Phase 2 — Usability & Automation Improvements

- [ ] Queue mode — process multiple movies in one run
- [ ] Skip if clips already exist (avoid re-clipping same movie)
- [ ] Vertical video conversion:
    - [ ] `--tiktok` flag → auto set `1080x1920` scale
    - [ ] Crop / pad as needed
- [ ] Branding overlay (optional watermark/logo)
- [ ] Auto-captioning (subtitles or Whisper-based)

---

## 🚀 Phase 3 — Automation & Scaling

- [ ] Batch output folders (ready for upload)
- [ ] TikTok upload integration:
    - [ ] CLI tools (e.g. `tiktok-uploader-cli`)
    - [ ] 3rd-party API (Jarvee, SocialPilot, etc)
    - [ ] Selenium script (fallback option)
- [ ] Scheduling (cron job to process & upload daily)
- [ ] Cloud deploy option (VPS / Lightsail)

---

## 🚀 Stretch Ideas / Future Features

- [ ] Automated scene ranking (score scenes by popularity)
- [ ] Multi-language subtitle support
- [ ] Auto-clip intro / outro bumpers
- [ ] Discord / Slack bot notifications on new clips
- [ ] Web dashboard to monitor / control pipeline

---

## 🚀 Notes & Gotchas

✅ Matching torrents by hash (lowercase) — robust  
✅ qBittorrent "seeding" = fully downloaded  
✅ `scale` param → needs `640x360` format (auto-normalize added)  
✅ Clipper now supports both `movies.json` and updated movies array  
✅ `skip-chatgpt` triggers built-in mock scenes  
✅ Subtitles optional — auto-detected if present

