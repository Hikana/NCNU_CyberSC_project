// backend/controllers/gameController.js
const questionService = require('../services/questionService');

// 使用一個高階函式來簡化 try/catch，讓 controller 更乾淨
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

class GameController {
  // --- 查詢 ---
  getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await questionService.fetchQuestionById(id);
    res.status(200).json({ success: true, data });
  });
  getQuestions = asyncHandler(async (req, res) => {
    const { level, category } = req.query; // 從 query string 取得過濾條件
    const data = await questionService.fetchQuestions({ level, category });
    res.status(200).json({ success: true, count: data.length, data });
  });

  getRandomQuestion = asyncHandler(async (req, res) => {
    const { level } = req.query;
    // 專案目前無登入流程，走無用戶模式，避免依賴 getUser
    console.log(`[Controller] 收到請求: level=${level}`);

    const data = await questionService.getRandomQuestion(parseInt(level || 1));
    res.status(200).json({ success: true, data });
  });

  getStageQuestions = asyncHandler(async (req, res) => {
    const { stage } = req.params;
    const data = await questionService.getGameStageQuestions(parseInt(stage || 1));
    res.status(200).json({ success: true, data, count: data.length });
  });

  // --- 互動 ---
  validateAnswer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ success: false, message: '請提供答案' });
    }
    const data = await questionService.validateAnswer(id, answer);
    res.status(200).json({ success: true, data });
  });
  
  getQuestionHint = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const data = await questionService.getQuestionHint(id);
      res.status(200).json({ success: true, data });
  });
  getQuestionStats = asyncHandler(async (req, res) => {
    const data = await questionService.getQuestionStatistics();
    res.status(200).json({ success: true, data });
  }); 
  calculateScore = asyncHandler(async (req, res) => {
      const { correctAnswers, totalQuestions, timeSpent, hintsUsed } = req.body;
      const score = questionService.calculateScore(correctAnswers, totalQuestions, timeSpent, hintsUsed);
      res.status(200).json({ success: true, data: { score } });
  });

  // --- 管理 ---
  addQuestion = asyncHandler(async (req, res) => {
    const questionData = req.body;
    // 基礎驗證
    if (!questionData.question || !questionData.correctAnswer || !questionData.level) {
      return res.status(400).json({ success: false, message: '缺少必要欄位' });
    }
    const data = await questionService.createQuestion(questionData);
    res.status(201).json({ success: true, message: '題目新增成功', data });
  });

  updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const questionData = req.body;
    await questionService.updateQuestion(id, questionData);
    res.status(200).json({ success: true, message: '題目更新成功' });
  });

  deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await questionService.deleteQuestion(id);
    res.status(200).json({ success: true, message: '題目刪除成功' });
  });
  
  clearAllQuestions = asyncHandler(async (req, res) => {
      await questionService.clearAllQuestions();
      res.status(200).json({ success: true, message: '所有題目已清空' });
  });
  // --- 新增：答題紀錄 API ---
  addHistory = asyncHandler(async (req, res) => {
        const { questionId, questionText, userAnswer, isCorrect } = req.body;
        // 基礎驗證
        if (!questionId || !userAnswer) {
            return res.status(400).json({ success: false, message: '缺少必要欄位' });
        }
        const entryData = { questionId, questionText, userAnswer, isCorrect };
        const data = await questionService.createHistoryEntry(entryData);
        res.status(201).json({ success: true, data });
    });

    getHistory = asyncHandler(async (req, res) => {
        const data = await questionService.fetchHistory();
        res.status(200).json({ success: true, data });
    });  


}

module.exports = new GameController();