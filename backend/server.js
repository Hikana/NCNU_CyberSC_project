// backend/server.js
const express = require('express');
const cors = require('cors');




// 1. 確保 Firebase 在伺服器啟動時就被初始化
require('./config/firebase');

const app = express();
const port = 3000;

// 2. 引入遊戲(答題)與建築(地圖)路由
const gameRoutes = require('./routes/gameRoutes');
const buildingRoutes = require('./routes/buildingRoutes');

// 中介軟體 (Middleware)
app.use(express.json()); // 讓 Express 能解析 JSON 格式的請求內容
app.use(cors());       // 允許跨來源請求，這樣前端才能呼叫後端
app.use(express.static('public'));

// 3. 註冊 API 路由
// 答題/題庫
app.use('/api/game', gameRoutes);
// 地圖/建築（語義清楚）
app.use('/api/buildings', buildingRoutes);
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
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`Upload tool: http://localhost:${port}/upload.html`);
});
