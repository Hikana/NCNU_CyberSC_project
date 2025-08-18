const express = require('express');
const router = express.Router();
const BuildingController = require('../controllers/buildingController');
const buildingController = new BuildingController();

router.get('/map', buildingController.getMap);
router.post('/buildings/place', buildingController.placeBuilding);

module.exports = router;