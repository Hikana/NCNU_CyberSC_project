// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// 資安事件相關路由
router.get('/:userId', eventController.getSecurityEvents);
router.post('/:userId', eventController.addSecurityEvent);
router.delete('/:userId/:eventId', eventController.resolveSecurityEvent);

// 玩家統計更新
router.put('/:userId/stats', eventController.updatePlayerStats);

module.exports = router;
