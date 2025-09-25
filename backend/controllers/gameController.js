const gameService = require('../services/gameService');
const questionService = require('../services/questionService');

// 這是一個小幫手函式，用來自動捕捉非同步函式中的錯誤，讓我們的程式碼更乾淨
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class GameController {
  constructor() {
    // 為了方便，我們先預設一個測試用玩家 ID
    this.getUserId = (req) => req.query.userId || 'test-user';
  }

  /**
   * 處理「獲取隨機題目」的請求（遊戲用）
   * 使用 GameService 以維持與 submitAnswer 相容的題目格式
   */
  getRandomQuestion = asyncHandler(async (req, res) => {
    const data = await gameService.getRandomQuestion(this.getUserId(req));
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「提交答案」的請求 - 只使用 GameService 記錄
   */
  submitAnswer = asyncHandler(async (req, res) => {
    console.log("收到的 req.body:", req.body);
    const { questionId, answer } = req.body;
    const userId = req.body.userId || this.getUserId(req);

    try {
      const result = await gameService.validateAnswer(userId, questionId, answer);
      console.log("✅ gameService.validateAnswer 執行成功，結果:", result);

      res.status(200).json({
        success: true,
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        question: result.question,
        userAnswer: result.userAnswer,
        yourAnswer: result.yourAnswer,
        newHistory: result.newHistory,
        gameData: result
      });
    } catch (error) {
      console.error("❌ gameService 執行失敗:", error);
      res.status(500).json({ 
        success: false, 
        error: '提交答案失敗',
        details: error.message 
      });
    }
  });

  /**
   * 處理「獲取地圖」的請求
   */
  getMap = asyncHandler(async (req, res) => {
    const data = await gameService.getMapState(this.getUserId(req));
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「放置建築」的請求
   */
  placeBuilding = asyncHandler(async (req, res) => {
    const { buildingId, position } = req.body;
    const data = await gameService.placeBuilding(this.getUserId(req), buildingId, position);
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「解鎖土地」的請求
   */
  unlockTile = asyncHandler(async (req, res) => {
    const { position } = req.body;
    const data = await gameService.unlockTile(this.getUserId(req), position);
    res.status(200).json({ success: true, data });
  });

  /**
   * 清除某格建築：恢復為 developed
   */
  clearBuilding = asyncHandler(async (req, res) => {
    const { position } = req.body;
    const data = await gameService.clearBuilding(this.getUserId(req), position);
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「獲取答題紀錄」的請求
   */
  getHistory = asyncHandler(async (req, res) => {
    const data = await gameService.getHistory();
    res.status(200).json({ success: true, data });
  });

  /**
   * 題庫管理/查詢（後台用）
   */
  getQuestions = asyncHandler(async (req, res) => {
    const { level, category } = req.query;
    const data = await questionService.fetchQuestions({ level, category });
    res.status(200).json({ success: true, count: data.length, data });
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

  deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await gameService.deleteQuestion(id);
    res.status(200).json({ success: true, message: '題目刪除成功' });
  });
  
  clearAllQuestions = asyncHandler(async (req, res) => {
    await gameService.clearAllQuestions();
    res.status(200).json({ success: true, message: '所有題目已清空' });
  });

  addQuestion = asyncHandler(async (req, res) => {
    const questionData = req.body;
    if (!questionData.question  || questionData.answer === undefined || !questionData.correctanswer || !questionData.level) {
      return res.status(400).json({ success: false, message: '缺少必要欄位' });
    }
    const data = await gameService.createQuestion(questionData);
    res.status(201).json({ success: true, message: '題目新增成功', data });
  });

  updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const questionData = req.body;
    await gameService.updateQuestion(id, questionData);
    res.status(200).json({ success: true, message: '題目更新成功' });
  });
}

// 匯出一個 GameController 的實例，讓 routes 可以直接使用
module.exports = new GameController();

