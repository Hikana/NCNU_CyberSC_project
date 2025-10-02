const gameService = require('../services/gameService');


// 這是一個小幫手函式，用來自動捕捉非同步函式中的錯誤，讓我們的程式碼更乾淨
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class GameController {
  
  

  /**
   * 處理「獲取隨機題目」的請求（遊戲用）
   * 使用 GameService 以維持與 submitAnswer 相容的題目格式
   */
  getRandomQuestion = asyncHandler(async (req, res) => {
    const userId = req.user.uid; 
    const data = await gameService.getRandomQuestion(userId);
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「提交答案」的請求 - 只使用 GameService 記錄
   */
  submitAnswer = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    console.log("收到的 req.body:", req.body);
    const { questionId, answer } = req.body;
    

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
        description: result.description,
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
    const userId = req.user.uid;
    const data = await gameService.getMapState(userId);
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「放置建築」的請求
   */
  placeBuilding = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { buildingId, position } = req.body;
    const data = await gameService.placeBuilding(userId, buildingId, position);
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「解鎖土地」的請求
   */
  unlockTile = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { position } = req.body;
    const data = await gameService.unlockTile(userId, position);
    res.status(200).json({ success: true, data });
  });

  /**
   * 清除某格建築：恢復為 developed
   */
  clearBuilding = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { position } = req.body;
    const data = await gameService.clearBuilding(userId, position);
    res.status(200).json({ success: true, data });
  });

  /**
   * 處理「獲取答題紀錄」的請求
   */
  getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    // 注意：我們需要稍微升級 getHistory 讓它也能接收 userId
    const data = await gameService.getHistory(userId); 
    res.status(200).json({ success: true, data });
  });
  // 新增答題紀錄
  addHistoryEntry = asyncHandler(async (req, res) => {
    const userId = req.user.uid; // 從 Firebase Auth 取得使用者 UID
    const historyData = req.body;

    const newEntry = await gameService.addHistoryEntryToSub(userId, historyData);
    res.status(200).json({ success: true, data: newEntry });
  });

  // 查詢個人答題紀錄
  getMyHistory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const history = await gameService.getUserHistoryFromSub(userId);
    res.status(200).json({ success: true, data: history });
  });


  /**
   * 題庫管理/查詢（後台用）
   */
  getQuestions = asyncHandler(async (req, res) => {
      const data = await gameService.fetchAllQuestions();
      res.status(200).json({ success: true, data });
  });


  // --- 互動 ---
  validateAnswer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ success: false, message: '請提供答案' });
    }
    const data = await gameService.validateAnswer(id, answer);
    res.status(200).json({ success: true, data });
  });

  getQuestionHint = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await gameService.getQuestionHint(id);
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
    if (!questionData.question  || questionData.answer === undefined || !questionData.correctanswer || !questionData.description) {
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

