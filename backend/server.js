// backend/server.js
const express = require('express');
const cors = require('cors');




// 1. 確保 Firebase 在伺服器啟動時就被初始化
require('./config/firebase');

const app = express();
const port = 3000;

// 2. 引入我們唯一且萬能的遊戲路由
const gameRoutes = require('./routes/gameRoutes');

// 中介軟體 (Middleware)
app.use(express.json()); // 讓 Express 能解析 JSON 格式的請求內容
app.use(cors());       // 允許跨來源請求，這樣前端才能呼叫後端
app.use(express.static('public'));

// 3. 註冊 API 路由
// 告訴 Express：所有以 /api/game 開頭的網址，都統一交給 gameRoutes.js 去處理
app.use('/api/game', gameRoutes);
// 伺服器健康檢查
app.get('/health', (req, res) => res.status(200).send('OK'));


// 4. 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`Upload tool: http://localhost:${port}/upload.html`);
});
