const { wss } = require('../app');

function broadcast(payload) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  });
}

module.exports = { broadcast };