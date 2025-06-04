import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

function StatusBar() {
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('info');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000/ws/status');

    ws.onopen = () => {
      console.log('✅ Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📡 WS:', data);

      setStatus(data.message || '');
      setOpen(true);

      // Set severity based on type
      if (data.type === 'error') {
        setSeverity('error');
      } else if (data.type === 'warning') {
        setSeverity('warning');
      } else {
        setSeverity('info');
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => ws.close();
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {status}
      </Alert>
    </Snackbar>
  );
}

export default StatusBar;