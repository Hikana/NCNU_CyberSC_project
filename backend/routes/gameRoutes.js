// backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// --- 答題相關 ---
// GET /api/game/random-question (遊戲主程式用)
router.get('/random-question', auth, gameController.getRandomQuestion);

// POST /api/game/submit-answer (遊戲主程式用)
router.post('/submit-answer', auth, gameController.submitAnswer);


// --- 地圖解鎖相關 ---
// POST /api/game/unlock-tile (遊戲主程式用)
router.post('/unlock-tile', auth, gameController.unlockTile);

// --- 管理/紀錄相關 ---
// GET /api/game/history (答題紀錄面板用)
router.get('/history', auth, gameController.getHistory);
router.post('/history', auth, gameController.addHistoryEntry);
router.get('/history/me', auth, gameController.getMyHistory);
// GET /api/game/questions (後台 upload.html 工具用)
router.get('/questions', auth, gameController.getQuestions);

router.delete('/questions', auth, gameController.clearAllQuestions);
// ✅ 新增這條路由給 upload.html 的「單獨刪除」按鈕使用
router.delete('/questions/:id', auth, gameController.deleteQuestion);
router.post('/questions', auth, gameController.addQuestion);
router.put('/questions/:id', auth, gameController.updateQuestion);
// 將設定好的路由匯出
module.exports = router;

