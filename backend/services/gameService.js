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
    let randomDefenseTool = null; // 初始化防禦工具變數
    
    if (isCorrect) {
      // 答對了，更新玩家的答題進度
      await playerData.addCorrectlyAnsweredId(userId, questionId);
      // 同時更新玩家的總答對題數
      await playerData.updatePlayer(userId, {
        answeredCount: FieldValue.increment(1)
      });
      
      // 🎁 發放獎勵：科技點 +50，防禦值 +10
      await this.giveRewards(userId, {
        techPoints: 50,
        defense: 10
      });
      
      // 🛡️ 隨機獲得防禦工具
      randomDefenseTool = await this.giveRandomDefenseTool(userId);
    } else {
      // 答錯了，扣除懲罰：科技點 -5，防禦值 -5
      await this.giveRewards(userId, {
        techPoints: -5,
        defense: -5
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
      description, // 回傳題目詳解
      newHistory,
      defenseTool: isCorrect ? randomDefenseTool : null // 只有答對時才包含防禦工具資訊
    };
  }

  // --- 獎勵系統 ---

  /**
   * 發放獎勵給玩家（支援正負數）
   * @param {string} userId - 玩家 ID
   * @param {object} rewards - 獎勵內容 
   */
  async giveRewards(userId, rewards) {
    try {
      console.log(`🎁 發放獎勵給玩家 ${userId}:`, rewards);
      
      // 先獲取玩家當前數值，確保不會扣除到負數
      const player = await playerData.getPlayer(userId);
      const updateData = {};
      
      // 處理科技點獎勵（支援正負數，但不會低於 0）
      if (rewards.techPoints !== undefined && rewards.techPoints !== 0) {
        const newTechPoints = Math.max(0, player.techPoints + rewards.techPoints);
        updateData.techPoints = newTechPoints;
        const sign = rewards.techPoints > 0 ? '+' : '';
        console.log(`  ${sign}${rewards.techPoints} 科技點 (當前: ${player.techPoints} → ${newTechPoints})`);
      }
      
      // 處理防禦值獎勵（支援正負數，但不會低於 0）
      if (rewards.defense !== undefined && rewards.defense !== 0) {
        const newDefense = Math.max(0, player.defense + rewards.defense);
        updateData.defense = newDefense;
        const sign = rewards.defense > 0 ? '+' : '';
        console.log(`  ${sign}${rewards.defense} 防禦值 (當前: ${player.defense} → ${newDefense})`);
      }
      
      // 更新玩家資料
      if (Object.keys(updateData).length > 0) {
        await playerData.updatePlayer(userId, updateData);
        console.log(`✅ 獎勵發放成功`);
      }
      
      return updateData;
    } catch (error) {
      console.error('❌ 發放獎勵失敗:', error);
      throw error;
    }
  }

  /**
   * 隨機給予防禦工具
   * @param {string} userId - 玩家 ID
   * @returns {object} - 獲得的防禦工具資訊
   */
  async giveRandomDefenseTool(userId) {
    try {
      // 防禦工具清單
      const defenseTools = [
        { id: 'cdn', name: 'CDN 分流雲網' },
        { id: 'prepared_statements', name: 'Prepared Statements（參數化查詢）' },
        { id: 'output_encoding', name: 'Output Encoding（輸出編碼）' },
        { id: 'mfa', name: 'MFA（多因素驗證）' },
        { id: 'code_signing', name: 'Code Signing（軟體簽章驗證）' },
        { id: 'port_blocking', name: 'Port Blocking（封鎖未用埠口）' },
      ];

      // 隨機選擇一個防禦工具
      const randomIndex = Math.floor(Math.random() * defenseTools.length);
      const selectedTool = defenseTools[randomIndex];
      

      // 簡化：只存儲數量到玩家資料中
      await playerData.updatePlayer(userId, {
        [`defenseTools.${selectedTool.id}`]: FieldValue.increment(1)
      });

      
      return {
        success: true,
        tool: selectedTool,
        message: `獲得防禦工具：${selectedTool.name}`
      };
    } catch (error) {
      console.error('❌ 發放防禦工具失敗:', error);
      throw error;
    }
  }

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

