const gameService = require('../services/gameService');
const { db } = require('../routes/firebase'); 

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
   * 處理「獲取隨機題目」的請求
   */
  getRandomQuestion = asyncHandler(async (req, res) => {
    const data = await gameService.getRandomQuestion(this.getUserId(req));
    res.status(200).json({ success: true, data });
  });

  
  /**
 * 處理「提交答案」的請求
 */
/**
 * 處理「提交答案」的請求
 */
/**
 * 處理「提交答案」的請求
 */
/**
 * 處理「提交答案」的請求 - 只使用 GameService 記錄
 */
submitAnswer = asyncHandler(async (req, res) => {
  console.log("收到的 req.body:", req.body);
  
  const { questionId, answer } = req.body;
  const userId = req.body.userId || this.getUserId(req);

  try {
    // 直接呼叫 gameService，讓它處理所有邏輯和記錄
    const result = await gameService.validateAnswer(userId, questionId, answer);
    
    console.log("✅ gameService.validateAnswer 執行成功，結果:", result);

    // 回傳 GameService 的完整結果給前端
    res.status(200).json({
      success: true,
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      question: result.question,        // 👈 加這行
      userAnswer: result.userAnswer,  
      yourAnswer: result.yourAnswer,    // 👈 加這行  
        // 👈 加這行（容錯）
      newHistory: result.newHistory,    // 原有的
      gameData: result                  // 原有的
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
   * 處理「獲取答題紀錄」的請求
   */
  getHistory = asyncHandler(async (req, res) => {
    const data = await gameService.getHistory();
    res.status(200).json({ success: true, data });
  });
  getQuestions = asyncHandler(async (req, res) => {
      const data = await gameService.fetchAllQuestions();
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
    if (!questionData.question  || questionData.answer === undefined|| !questionData.correctanswer || !questionData.level) {
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

