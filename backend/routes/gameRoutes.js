// backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// --- 規則：把最具体的路由放在最前面 ---

// --- 特殊查詢 (比 /:id 更具体) ---
router.get('/questions/random', gameController.getRandomQuestion);
router.get('/questions/stage/:stage', gameController.getStageQuestions);
router.get('/questions/stats', gameController.getQuestionStats);

// --- 列表查詢 & 新增 (比 /:id 更具体) ---
router.get('/questions', gameController.getQuestions);
router.post('/questions', gameController.addQuestion);

// --- 互動 (子資源，比 /:id 更具体) ---
router.get('/questions/:id/hint', gameController.getQuestionHint);
router.post('/questions/:id/validate', gameController.validateAnswer);

// --- 針對單一 ID 的操作 (最通用，所以放後面) ---
router.get('/questions/:id', gameController.getQuestionById);
router.put('/questions/:id', gameController.updateQuestion);
router.delete('/questions/:id', gameController.deleteQuestion);

// --- 獨立功能 ---
router.post('/score/calculate', gameController.calculateScore);

// --- (危險) 管理員功能 ---
router.delete('/questions', gameController.clearAllQuestions);

// --- 新增：答題紀錄路由 ---
router.get('/history', gameController.getHistory);
router.post('/history', gameController.addHistory);
module.exports = router;
