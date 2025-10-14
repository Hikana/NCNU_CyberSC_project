// backend/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const auth = require('../middleware/auth');

// 取得自己的玩家資料
router.get('/me', auth, playerController.getPlayer);

// 更新自己的玩家科技點
router.put('/me/techPoints', auth, playerController.updateTechPoints);

// 更新自己的玩家防禦值
router.put('/me/defense', auth, playerController.updateDefense);

// 更新自己的玩家城堡等級
router.put('/me/castleLevel', auth, playerController.updateCastleLevel);

// --- 成就系統路由（統一 /me） ---

// 取得所有成就（不需要玩家 ID）
router.get('/achievements', playerController.getAchievements);

// 取得自己的成就進度
router.get('/me/achievements', auth, playerController.getPlayerAchievements);

// 更新自己的成就狀態（領取獎勵）
router.put('/me/achievements/:achievementId', auth, playerController.updatePlayerAchievement);

// 檢查並更新自己的成就進度
router.post('/me/achievements/check', auth, playerController.checkAchievements);

module.exports = router;
