const express = require('express');
const router = express.Router();
const invCtrl = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

// 取得自己的背包（統一 /me）
router.get('/me', auth, invCtrl.getInventory);

// 如需管理者查詢其他玩家背包，未來另開管理路由

// 新增物品到自己的背包
router.post('/me/add', auth, invCtrl.addItem);

// 使用自己的背包物品
router.post('/me/use', auth, invCtrl.useItem);

// 使用防禦工具
router.post('/use-tool', auth, invCtrl.useDefenseTool);

module.exports = router;