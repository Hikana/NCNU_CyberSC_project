// backend/routes/buildingRoutes.js
const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const auth = require('../middleware/auth');

// --- 建築相關路由 ---

// 取得地圖狀態（需登入）
router.get('/map', auth, buildingController.getMap);

// 放置建築（需登入）
router.post('/place', auth, buildingController.placeBuilding);

// 架設防火牆（需登入）
router.post('/firewall', auth, buildingController.placeFirewall);

// 移除建築（需登入）
router.delete('/remove/:x/:y', auth, buildingController.removeBuilding);

// 取得建築列表（商店用）
router.get('/shop', buildingController.getBuildingShop);

// 取得建築資訊
router.get('/info/:buildingId', buildingController.getBuildingInfo);

// --- 連線相關路由 ---

// 取得連線列表（需登入）
router.get('/connections', auth, buildingController.getConnections);

// 添加連線（需登入）
router.post('/connections', auth, buildingController.addConnection);

// 刪除連線（需登入）
router.delete('/connections/:connectionId', auth, buildingController.removeConnection);

module.exports = router;
