// backend/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// 取得玩家背包
router.get('/:id/inventory', playerController.getInventory);

// 覆寫玩家背包（整包存回）
router.post('/:id/inventory', playerController.setInventory);

module.exports = router;


