// backend/server.js
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Game API: http://localhost:${PORT}/api/game`);
  console.log(`upload:http://localhost:${PORT}/upload`)
});