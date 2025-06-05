import { useState, useEffect } from 'react';

export default function useHealth(pollInterval = 5000) {
  const [health, setHealth] = useState({
    api: 'unknown',
    db: 'unknown',
    clipsFolder: 'unknown',
    websocket: 'unknown',
    version: 'unknown',
  });

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        console.error('❌ Failed to fetch /api/health:', err);
        setHealth((prev) => ({ ...prev, api: 'offline' }));
      }
    }

    // Initial fetch
    fetchHealth();

    // Polling
    const interval = setInterval(fetchHealth, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return health;
}