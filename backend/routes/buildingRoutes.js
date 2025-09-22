const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

// 地圖/建築相關（委派給 gameService 實作）
router.get('/map', buildingController.getMap);
router.post('/place-building', buildingController.placeBuilding);
router.post('/unlock-tile', buildingController.unlockTile);
router.post('/clear-building', buildingController.clearBuilding);

module.exports = router;
