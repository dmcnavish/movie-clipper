const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');

async function generateSubtitlesWithWhisper(videoPath) {
  console.log(`🎙️ Extracting audio for Whisper...`);

  const audioPath = videoPath.replace(/\.[^.]+$/, '_audio.mp4');

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('aac')
      .format('mp4')
      .save(audioPath)
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`✅ Audio extracted: ${audioPath}`);
  console.log(`🎙️ Sending audio to Whisper API...`);

  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioPath));
  formData.append('model', 'whisper-1'); // Whisper API model
  formData.append('response_format', 'srt'); // Get .srt format back

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const srtText = response.data;
    const srtPath = videoPath.replace(/\.[^.]+$/, '.srt');

    fs.writeFileSync(srtPath, srtText, 'utf-8');

    console.log(`✅ Whisper subtitles generated: ${srtPath}`);

    // Optionally delete temp audio
    fs.unlinkSync(audioPath);

    return srtPath;

  } catch (err) {
    console.error(`❌ Whisper API error:`, err.response ? err.response.data : err.message);
    return null;
  }
}

module.exports = { generateSubtitlesWithWhisper };