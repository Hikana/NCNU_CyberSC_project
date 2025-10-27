const express = require('express');
const cors = require('cors');
const path = require('path');
const gameRoutes = require('./routes/gameRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const playerRoutes = require('./routes/playerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
// 中介軟體
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:5173', 'http://localhost:5175'] 
    : true, // 開發環境允許來源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 提供靜態文件服務
app.use('/public', express.static(path.join(__dirname, 'public')));

// 上傳頁面路由
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// API 路由
app.use('/api/game', gameRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/events', eventRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


module.exports = app;

