const gameData = require('../models/gameData');
const playerData = require('../models/playerData');
const { FieldValue } = require('../config/firebase');

// 與前端 IsoGrid 對齊的城堡座標（以 row,col = y,x）
const CASTLE_TILES = new Set([
  '0,0','0,1','0,2',
  '1,0','1,1','1,2',
  '2,0','2,1','2,2',
]);
const isCastleTile = (row, col) => CASTLE_TILES.has(`${row},${col}`);

/**
 * GameService 類別
 * 職責：處理所有遊戲的核心商業邏輯。
 */
class GameService {
  // --- 答題相關 ---

  /**
   * 獲取一個玩家尚未答對的隨機題目
   * @param {string} userId - 玩家 ID
   */
  async getRandomQuestion(userId) {
    // 註：在我們的最終架構中，玩家答題進度是由 playerData 管理，而非 gameData
    const player = await playerData.getPlayer(userId); 
    const excludeIds = player.correctlyAnsweredIds || [];
    const question = await gameData.findRandomQuestion({ excludeIds });
    
    if (!question && excludeIds.length > 0) {
      console.log(`玩家 ${userId} 已答完所有題目，重置紀錄`);
      // 答完後重置答題進度
      await playerData.updatePlayer(userId, { correctlyAnsweredIds: [] });
      return gameData.findRandomQuestion({});
    }
    return question;
  }

  /**
   * 驗證玩家的答案，並更新所有相關狀態
   * @param {string} userId - 玩家 ID
   * @param {string} questionId - 題目 ID
   * @param {number} userAnswerIndex - 玩家選擇的答案索引
   */
  async validateAnswer(userId, questionId, userAnswerIndex) {
    const question = await gameData.getQuestionById(questionId);
    if (!question) {
      throw new Error('找不到該題目');
    }

    // 安全檢查：確保題目資料格式正確
    if (!Array.isArray(question.options) || typeof question.answer !== 'number') {
        console.error(`❌ 問題 ${questionId} 資料錯誤：缺少 'options' 或 'answer' 欄位。`, question);
        throw new Error(`題目資料格式不正確 (ID: ${questionId})`);
    }

    const isCorrect = question.answer === userAnswerIndex;
    
    if (isCorrect) {
      // 答對了，更新玩家的答題進度
      await playerData.addCorrectlyAnsweredId(userId, questionId);
      // 同時更新玩家的總答對題數
      await playerData.updatePlayer(userId, {
        answeredCount: FieldValue.increment(1)
      });
    }
    const description=question.description;
    const correctAnswerText = question.options[question.answer] || '未知';
    // 無論對錯，都建立一筆歷史紀錄
    const newHistory = await gameData.addHistoryEntry({
        userId,
        questionId,
        description,
        correctAnswer: correctAnswerText,
        questionTitle: question.question,
        userAnswer: question.options[userAnswerIndex] || '無效選擇',
        isCorrect
    });

    // 將包含新紀錄的完整結果回傳給前端
    return { 
      isCorrect, 
      correctAnswer: question.options[question.answer], 
      userAnswer: question.options[userAnswerIndex],
      yourAnswer: question.options[userAnswerIndex], // 為了相容性
      question: question.question,
      newHistory 
    };
  }

  // --- 地圖解鎖相關 ---

  async unlockTile(playerId, position) {
    try {
      await playerData.updateTile(playerId, position.x, position.y, { status: 'developed' });
      await playerData.updatePlayer(playerId, { developedCount: FieldValue.increment(1) });
      
      // 返回解鎖後的狀態（簡化版本，不包含建築資訊）
      const landData = await playerData.getPlayerLand(playerId);
      const size = 20;
      const mapArray = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({ status: 'locked' }))
      );

      Object.keys(landData).forEach(key => {
        const [x, y] = key.split('_').map(Number);
        const cell = landData[key];
        mapArray[y][x] = isCastleTile(y, x) ? { ...cell, type: 'castle' } : cell;
      });

      return mapArray;
    } catch (error) {
      console.error('unlockTile 錯誤:', error);
      throw error;
    }
  }
  
  // --- 其他 ---
  async addHistoryEntryToSub(userId, historyData) {
    return await gameData.addHistoryEntryToSub(userId, historyData);
  }

  async getUserHistoryFromSub(userId) {
    return await gameData.getUserHistoryFromSub(userId);
  }

  async getHistory(userId) {
      return gameData.getHistory(userId);
  }
  async fetchAllQuestions() {
    return gameData.getAllQuestions();
  }

  async deleteQuestion(id) { return gameData.deleteQuestion(id); }
  async clearAllQuestions() { return gameData.clearAllQuestions(); }
  async createQuestion(questionData) { return gameData.addQuestion(questionData); }
  async updateQuestion(id, data) { return gameData.updateQuestion(id, data); }
}
module.exports = new GameService();

