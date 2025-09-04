const express = require('express');
const router = express.Router();
const BuildingController = require('../controllers/buildingController');
const buildingController = new BuildingController();

// 獲取地圖數據
router.get('/map', buildingController.getMap);

// 放置建築
router.post('/', buildingController.placeBuilding);

module.exports = router;
