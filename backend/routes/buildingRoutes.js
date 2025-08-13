const express = require('express')
const router = express.Router()
const { placeBuilding } = require('../controllers/buildingController')

router.post('/buildings', placeBuilding)

module.exports = router
