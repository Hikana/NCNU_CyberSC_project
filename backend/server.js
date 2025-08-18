const express = require('express');
const cors = require('cors');
// 引入所有路由
const gameRoutes = require('./routes/gameRoutes');
const buildingRoutes = require('./routes/buildingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 掛載路由
// 所有遊戲、題目、歷史紀錄相關的 API 都會是 /api/game/...
app.use('/api/game', gameRoutes);
// 所有建築、地圖相關的 API 都會是 /api/buildings/...
app.use('/api/buildings', buildingRoutes);


// 伺服器健康檢查
app.get('/health', (req, res) => res.status(200).send('OK'));

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Upload tool: http://localhost:${PORT}/upload.html`);
});