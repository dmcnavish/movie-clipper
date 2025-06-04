import React, { useState, useEffect } from 'react';
import { Typography, Box, LinearProgress } from '@mui/material';

function Status() {
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

useEffect(() => {
  const ws = new WebSocket('ws://localhost:4000/ws/status');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📡 WS:', data);

    setProgressMessage(data.message || '');

    // Simple example: map message type to progress % (you can improve this logic!)
    if (data.message?.includes('Processing')) setProgressPercent(10);
    else if (data.message?.includes('Downloaded')) setProgressPercent(40);
    else if (data.message?.includes('Clipped')) setProgressPercent(80);
    else if (data.message?.includes('Completed')) setProgressPercent(100);
    else if (data.message?.includes('Failed')) setProgressPercent(0);
  };

  return () => ws.close();
}, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>📡 System Status</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>{progressMessage}</Typography>
      <LinearProgress variant="determinate" value={progressPercent} />
    </Box>
  );
}

export default Status;