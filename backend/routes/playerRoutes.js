// backend/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// 取得玩家資料
router.get('/:id', playerController.getPlayer);

// 更新玩家科技點
router.put('/:id/techPoints', playerController.updateTechPoints);

// 更新玩家防禦值
router.put('/:id/defense', playerController.updateDefense);

// 更新玩家城堡等級
router.put('/:id/castleLevel', playerController.updateCastleLevel);

// 取得玩家背包
router.get('/:id/inventory', playerController.getInventory);

// 覆寫玩家背包（整包存回）
router.post('/:id/inventory', playerController.setInventory);

// --- 成就系統路由 ---

// 取得所有成就（不需要玩家 ID）
router.get('/achievements', playerController.getAchievements);

// 取得特定玩家的成就進度
router.get('/:id/achievements', playerController.getPlayerAchievements);

// 更新玩家成就狀態（領取獎勵）
router.put('/:id/achievements/:achievementId', playerController.updatePlayerAchievement);

// 檢查並更新成就進度
router.post('/:id/achievements/check', playerController.checkAchievements);

module.exports = router;


