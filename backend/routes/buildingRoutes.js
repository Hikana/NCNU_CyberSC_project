// backend/routes/buildingRoutes.js
const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

// --- 建築相關路由 ---

// 取得地圖狀態
router.get('/map', buildingController.getMap);

// 放置建築
router.post('/place', buildingController.placeBuilding);

// 移除建築
router.delete('/:x/:y', buildingController.removeBuilding);

// 取得建築列表（商店用）
router.get('/shop', buildingController.getBuildingShop);

// 取得建築資訊
router.get('/info/:buildingId', buildingController.getBuildingInfo);

module.exports = router;
