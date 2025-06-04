const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');
const http = require('http');
const morgan = require('morgan');

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// API routes
const movieRoutes = require('./api/movies');
const sceneRoutes = require('./api/scenes');
const clipRoutes = require('./api/clips');
const statusRoutes = require('./api/status');
const errorRoutes = require('./api/errors');

app.use('/api/movies', movieRoutes);
app.use('/api/scenes', sceneRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/errors', errorRoutes);
// 🚀 Serve clips folder statically
app.use('/clips', express.static('clips'));

// Start HTTP server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Backend API running at http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws/status' });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  ws.send(JSON.stringify({ type: 'status', message: 'Connected to WebSocket' }));

  // Example: can broadcast status updates here
  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
  });
});

// Export wss so services can broadcast updates
module.exports = { wss };