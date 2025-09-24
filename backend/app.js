const express = require('express');
const cors = require('cors');
const path = require('path');
const gameRoutes = require('./routes/gameRoutes');

const inventoryRoutes = require('./routes/inventory');

const app = express();
// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 提供靜態文件服務
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/inventory', inventoryRoutes);

// 上傳頁面路由
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// API 路由
app.use('/api/game', gameRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});




module.exports = app;

