const express = require('express');
const router = express.Router();
const invCtrl = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

// 取得玩家背包（若需安全可以用 req.user.uid 而非 params）
router.get('/:playerId', auth, invCtrl.getInventory);

// 新增物品
router.post('/:playerId/add', auth, invCtrl.addItem);

// 使用物品（扣除）
router.post('/:playerId/use', auth, invCtrl.useItem);

module.exports = router;