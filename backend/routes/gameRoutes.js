// backend/routes/gameRoutes.js
const express = require('express');
const gameController = require('../controllers/gameController');

const router = express.Router();

// 題目相關路由
router.get('/questions', gameController.getAllQuestions);
router.get('/questions/level/:level', gameController.getQuestionsByLevel);
router.get('/questions/category/:category', gameController.getQuestionsByCategory);
router.get('/questions/random', gameController.getRandomQuestion);
router.get('/questions/stage/:stage', gameController.getStageQuestions);
router.get('/questions/:id', gameController.getQuestionById);

// 遊戲互動路由
router.post('/questions/:id/answer', gameController.validateAnswer);
router.get('/questions/:id/hint', gameController.getQuestionHint);

// 統計和管理路由
router.get('/stats/questions', gameController.getQuestionStats);
router.post('/score/calculate', gameController.calculateScore);

// 管理員路由（新增、編輯、刪除題目）
router.post('/questions', gameController.addQuestion);
router.put('/questions/:id', gameController.updateQuestion);
router.delete('/questions/all', gameController.clearAllQuestions); 
router.delete('/questions/:id', gameController.deleteQuestion);

module.exports = router;