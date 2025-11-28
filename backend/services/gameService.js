const gameData = require('../models/gameData');
const playerData = require('../models/playerData');
const eventService = require('./eventService');
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
   * 驗證玩家的答案，並更新所有相關狀態（優化版：合併資料庫操作）
   * @param {string} userId - 玩家 ID
   * @param {string} questionId - 題目 ID
   * @param {number} userAnswerIndex - 玩家選擇的答案索引
   */
  async validateAnswer(userId, questionId, userAnswerIndex) {
    // 並行讀取題目和玩家資料，減少等待時間
    const [question, player] = await Promise.all([
      gameData.getQuestionById(questionId),
      playerData.getPlayer(userId)
    ]);

    if (!question) {
      throw new Error('找不到該題目');
    }

    // 安全檢查：確保題目資料格式正確
    if (!Array.isArray(question.options) || typeof question.answer !== 'number') {
        console.error(`❌ 問題 ${questionId} 資料錯誤：缺少 'options' 或 'answer' 欄位。`, question);
        throw new Error(`題目資料格式不正確 (ID: ${questionId})`);
    }

    const isCorrect = question.answer === userAnswerIndex;
    const description = question.description;
    const correctAnswerText = question.options[question.answer] || '未知';
    let randomDefenseTool = null;

    // 準備批量更新的資料
    const updateData = {};
    
    if (isCorrect) {
      // 答對了：準備所有更新資料
      updateData.correctlyAnsweredIds = FieldValue.arrayUnion(questionId);
      updateData.answeredCount = FieldValue.increment(1);
      
      // 計算獎勵（科技點 +15，防禦值 +15）
      const newTechPoints = Math.max(0, (player.techPoints || 0) + 15);
      const newDefense = Math.max(0, (player.defense || 0) + 15);
      updateData.techPoints = newTechPoints;
      updateData.defense = newDefense;
      
      // 隨機選擇防禦工具（先選擇，稍後一起更新）
      const defenseTools = [
        { id: 'cdn', name: 'CDN 分流雲網' },
        { id: 'prepared_statements', name: 'Prepared Statements（參數化查詢）' },
        { id: 'output_encoding', name: 'Output Encoding（輸出編碼）' },
        { id: 'mfa', name: 'MFA（多因素驗證）' },
        { id: 'code_signing', name: 'Code Signing（軟體簽章驗證）' },
        { id: 'port_blocking', name: 'Port Blocking（封鎖未用埠口）' },
      ];
      const randomIndex = Math.floor(Math.random() * defenseTools.length);
      const selectedTool = defenseTools[randomIndex];
      updateData[`defenseTools.${selectedTool.id}`] = FieldValue.increment(1);
      randomDefenseTool = {
        success: true,
        tool: selectedTool,
        message: `獲得防禦工具：${selectedTool.name}`
      };
      
    } else {
      // 答錯了：計算懲罰（科技點 -5，防禦值 -5）
      const newTechPoints = Math.max(0, (player.techPoints || 0) - 5);
      const newDefense = Math.max(0, (player.defense || 0) - 5);
      updateData.techPoints = newTechPoints;
      updateData.defense = newDefense;
      
    }

    // 使用批量寫入：一次性更新所有玩家資料
    await playerData.updatePlayer(userId, updateData);

    // 歷史記錄異步寫入（不阻塞主流程）
    const historyPromise = gameData.addHistoryEntry({
      userId,
      questionId,
      description,
      correctAnswer: correctAnswerText,
      questionTitle: question.question,
      userAnswer: question.options[userAnswerIndex] || '無效選擇',
      isCorrect
    }).catch(err => {
      console.error('❌ 寫入歷史記錄失敗（不影響答題結果）:', err);
      return null; // 返回 null 表示失敗，但不影響主流程
    });

    // 等待歷史記錄完成（但已經不阻塞主流程了）
    const newHistory = await historyPromise;

    // 計算更新後的答對題數（用於前端顯示）
    const newAnsweredCount = isCorrect 
      ? (player.answeredCount || 0) + 1 
      : (player.answeredCount || 0);

    // 將包含新紀錄的完整結果回傳給前端
    // 優化：直接返回更新後的玩家數值，減少前端需要再次調用 API
    return { 
      isCorrect, 
      correctAnswer: question.options[question.answer], 
      userAnswer: question.options[userAnswerIndex],
      yourAnswer: question.options[userAnswerIndex], // 為了相容性
      question: question.question,
      description, // 回傳題目詳解
      newHistory,
      defenseTool: isCorrect ? randomDefenseTool : null, // 只有答對時才包含防禦工具資訊
      // 新增：返回更新後的玩家數值，讓前端可以直接更新本地狀態
      updatedPlayerData: {
        techPoints: updateData.techPoints,
        defense: updateData.defense,
        answeredCount: newAnsweredCount
      }
    };
  }

  // 注意：giveRewards 和 giveRandomDefenseTool 已整合到 validateAnswer 中，不再需要單獨的函數

  // --- 地圖解鎖相關 ---

  async unlockTile(userId, position) {
    try {
      await playerData.updateTile(userId, position.x, position.y, { status: 'developed' });
      await playerData.updatePlayer(userId, { developedCount: FieldValue.increment(1) });
      
      // 🎲 檢查是否觸發隨機事件（委託給 eventService）
      const eventResult = await eventService.checkForRandomEvent(userId, position);
      
      // 返回解鎖後的狀態（簡化版本，不包含建築資訊）
      const landData = await playerData.getPlayerLand(userId);
      const size = 20;
      const mapArray = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({ status: 'locked' }))
      );

      Object.keys(landData).forEach(key => {
        const [x, y] = key.split('_').map(Number);
        const cell = landData[key];
        mapArray[y][x] = isCastleTile(y, x) ? { ...cell, type: 'castle' } : cell;
      });

      return {
        map: mapArray,
        triggeredEvent: eventResult // 包含觸發的事件資訊
      };
    } catch (error) {
      console.error('unlockTile 錯誤:', error);
      throw error;
    }
  }

  /**
   * 隨機選擇事件類型（保留此方法以維持向後相容性）
   * @returns {string} - 事件類型
   */
  selectRandomEventType() {
    // 此方法已棄用，現在使用基於權重的選擇（在 eventService 中）
    // 保留此方法僅為了向後相容
    const eventTypes = ['ddos', 'sql_injection', 'xss', 'brute_force', 'supply_chain', 'unauthorized_access'];
    return eventTypes[Math.floor(Math.random() * eventTypes.length)];
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

