const express = require('express');
const cors = require('cors');
// 引入所有路由
const gameRoutes = require('./routes/gameRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const playerRoutes = require('./routes/playerRoutes');
const inventoryRoutes = require('./routes/inventory');


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
// 玩家與背包
app.use('/api/players', playerRoutes);
//工具
app.use('/api/inventory', inventoryRoutes);


// 伺服器健康檢查
app.get('/health', (req, res) => res.status(200).send('OK'));

// 404 處理：未匹配的路由回傳 JSON
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// 全域錯誤處理：確保一律回傳 JSON 而非 HTML
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server Error' });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Upload tool: http://localhost:${PORT}/upload.html`);
});
