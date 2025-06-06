const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const moviesRouter = require('./api/movies');
const clipsRouter = require('./api/clips');
const scenesRouter = require('./api/scenes');
const healthRouter = require('./api/health');
const { createStatusWebSocketServer } = require('./websockets/statusPublisher');
require('dotenv').config();

const app = express();
const server = http.createServer(app);


// Start WebSocket server
createStatusWebSocketServer(server);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/movies', moviesRouter);
app.use('/api/clips', clipsRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/health', healthRouter);

// Serve clips folder
app.use('/clips', express.static('clips'));

// Serve frontend
app.use(express.static('frontend/dist'));
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'frontend/dist' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});