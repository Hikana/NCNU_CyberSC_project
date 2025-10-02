// backend/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const verifyToken = require('../middleware/authMiddleware');

// 🔐 加上驗證
router.get('/me/inventory', verifyToken, playerController.getInventory);
router.post('/me/inventory', verifyToken, playerController.setInventory);
router.get('/me',verifyToken,playerController.getPlayer)

module.exports = router;
