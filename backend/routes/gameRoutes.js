// backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// --- 答題相關 ---
// GET /api/game/random-question (遊戲主程式用)
router.get('/random-question', gameController.getRandomQuestion);

// POST /api/game/submit-answer (遊戲主程式用)
router.post('/submit-answer', gameController.submitAnswer);


// --- 地圖/世界相關 ---
// GET /api/game/map (遊戲主程式用)
router.get('/map', gameController.getMap);

// POST /api/game/place-building (遊戲主程式用)
router.post('/place-building', gameController.placeBuilding);

// POST /api/game/unlock-tile (遊戲主程式用)
router.post('/unlock-tile', gameController.unlockTile);
router.post('/clear-building', gameController.clearBuilding);


// --- 管理/紀錄相關 ---
// GET /api/game/history (答題紀錄面板用)
router.get('/history', gameController.getHistory);

// GET /api/game/questions (後台 upload.html 工具用)
router.get('/questions', gameController.getQuestions);

router.delete('/questions', gameController.clearAllQuestions);
// ✅ 新增這條路由給 upload.html 的「單獨刪除」按鈕使用
router.delete('/questions/:id', gameController.deleteQuestion);
router.post('/questions', gameController.addQuestion);
router.put('/questions/:id', gameController.updateQuestion);
// 將設定好的路由匯出
module.exports = router;

