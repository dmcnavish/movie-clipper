const WebSocket = require('ws');

let wss;
let isWebSocketRunning = false;

function createStatusWebSocketServer(server) {
  wss = new WebSocket.Server({ server, path: '/ws/status' });

  isWebSocketRunning = true;

  wss.on('connection', (ws) => {
    console.log('✅ WebSocket client connected');
    ws.send(JSON.stringify({ type: 'info', message: 'WebSocket connected' }));

    ws.on('close', () => {
      console.log('❌ WebSocket client disconnected');
    });
  });
}

function broadcast(message) {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

module.exports = { createStatusWebSocketServer, broadcast, isWebSocketRunning };