import React, { useState, useEffect } from 'react';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion } from 'framer-motion';

function Clips() {
  const [clips, setClips] = useState([]);

  const fetchClips = async () => {
    const response = await fetch('http://localhost:4000/api/clips');
    const data = await response.json();
    setClips(data.clips || []);
  };

  const handleCopy = (path) => {
    navigator.clipboard.writeText(path);
  };

  useEffect(() => {
    fetchClips();
    const interval = setInterval(fetchClips, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>🎞️ Generated Clips</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {clips.map((clip) => {
          const clipUrl = `http://localhost:4000${clip.clip_path.replace(/^.*\/clips/, '/clips')}`;
          return (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ border: '1px solid #555', borderRadius: 1, p: 1, boxShadow: 1 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Movie ID: {clip.movie_id}
                  <Tooltip title="Copy path">
                    <IconButton size="small" onClick={() => handleCopy(clipUrl)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <video
                  src={clipUrl}
                  controls
                  style={{ width: '100%', borderRadius: 4 }}
                />
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}

export default Clips;