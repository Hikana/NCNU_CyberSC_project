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

// 移除建築（需登入）
router.delete('/:x/:y', auth, buildingController.removeBuilding);

// 取得建築列表（商店用）
router.get('/shop', buildingController.getBuildingShop);

// 取得建築資訊
router.get('/info/:buildingId', buildingController.getBuildingInfo);

// 同步目前使用者的地圖狀態（以前端傳來的 map 為準）
router.post('/map/sync', auth, buildingController.syncMap);

module.exports = router;
