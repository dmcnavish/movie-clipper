import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import useHealth from '../hooks/useHealth';

const StatusBar = () => {
  const [wsStatus, setWsStatus] = useState('Disconnected');
  const health = useHealth();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000/ws/status');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsStatus('Connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsStatus('Disconnected');
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setWsStatus('Error');
    };

    return () => {
      ws.close();
    };
  }, []);

  const renderStatusChip = (label, value) => {
    const isGood = value === 'online' || value === 'exists';
    const isUnknown = value === 'unknown';

    return (
      <Chip
        label={`${label}: ${value}`}
        color={isUnknown ? 'default' : isGood ? 'success' : 'error'}
        variant="outlined"
        sx={{ minWidth: 150 }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        System Health
      </Typography>
      <Stack direction="row" spacing={1}>
        {/* Your original WebSocket connection status */}
        <Chip
          label={`WebSocket: ${wsStatus}`}
          color={wsStatus === 'Connected' ? 'success' : wsStatus === 'Disconnected' ? 'error' : 'warning'}
          variant="outlined"
        />

        {/* Polled health status */}
        {renderStatusChip('API', health.api)}
        {renderStatusChip('DB', health.db)}
        {renderStatusChip('Clips', health.clipsFolder)}
        <Chip
          label={`v${health.version}`}
          color="info"
          variant="outlined"
          sx={{ minWidth: 80 }}
        />
      </Stack>
    </Box>
  );
};

export default StatusBar;