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
      
      // 🎁 發放獎勵：科技點 +50，防禦值 +10
      await this.giveRewards(userId, {
        techPoints: 50,
        defense: 10
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

  // --- 獎勵系統 ---

  /**
   * 發放獎勵給玩家
   * @param {string} userId - 玩家 ID
   * @param {object} rewards - 獎勵內容 { techPoints, defense, ... }
   */
  async giveRewards(userId, rewards) {
    try {
      console.log(`🎁 發放獎勵給玩家 ${userId}:`, rewards);
      
      const updateData = {};
      
      // 處理科技點獎勵
      if (rewards.techPoints && rewards.techPoints > 0) {
        updateData.techPoints = FieldValue.increment(rewards.techPoints);
        console.log(`  +${rewards.techPoints} 科技點`);
      }
      
      // 處理防禦值獎勵
      if (rewards.defense && rewards.defense > 0) {
        updateData.defense = FieldValue.increment(rewards.defense);
        console.log(`  +${rewards.defense} 防禦值`);
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

  // --- 地圖解鎖相關 ---

  async unlockTile(userId, position) {
    try {
      await playerData.updateTile(userId, position.x, position.y, { status: 'developed' });
      await playerData.updatePlayer(userId, { developedCount: FieldValue.increment(1) });
      
      // 🎲 檢查是否觸發隨機事件
      const eventResult = await this.checkForRandomEvent(playerId, position);
      
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
   * 檢查是否觸發隨機事件
   * @param {string} playerId - 玩家 ID
   * @param {object} position - 解鎖位置 { x, y }
   * @returns {object|null} - 觸發的事件資訊或 null
   */
  async checkForRandomEvent(playerId, position) {
    try {
      const { x, y } = position;
      
      // 🚫 避免在 0-4*0-4 區域觸發事件
      if (x >= 0 && x <= 4 && y >= 0 && y <= 4) {
        console.log(`位置 (${x}, ${y}) 在安全區域內，不觸發事件`);
        return null;
      }
      
      // 🎲 根據位置決定觸發機率
      const triggerChance = this.calculateEventTriggerChance(x, y);
      const randomValue = Math.random();
      
      console.log(`位置 (${x}, ${y}) 觸發機率: ${(triggerChance * 100).toFixed(1)}%, 隨機值: ${(randomValue * 100).toFixed(1)}%`);
      
      if (randomValue < triggerChance) {
        // 觸發事件
        const eventType = this.selectRandomEventType(x, y);
        const eventId = Date.now(); // 使用時間戳作為唯一ID
        
        console.log(`🎲 在位置 (${x}, ${y}) 觸發事件: ${eventType}`);
        
        return {
          id: eventId,
          type: eventType,
          position: { x, y },
          timestamp: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('檢查隨機事件失敗:', error);
      return null;
    }
  }

  /**
   * 計算事件觸發機率
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @returns {number} - 觸發機率 (0-1)
   */
  calculateEventTriggerChance(x, y) {
    // 基礎機率
    let baseChance = 0.3; // 30% 基礎機率
    
    // 根據距離城堡中心的距離調整機率
    const castleCenterX = 1; // 城堡中心 X
    const castleCenterY = 1; // 城堡中心 Y
    const distance = Math.sqrt(Math.pow(x - castleCenterX, 2) + Math.pow(y - castleCenterY, 2));
    
    // 距離越遠，機率越高
    const distanceBonus = Math.min(distance * 0.05, 0.4); // 最多增加 40%
    
    // 邊界區域機率更高
    const isEdge = x === 0 || x === 19 || y === 0 || y === 19;
    const edgeBonus = isEdge ? 0.2 : 0; // 邊界增加 20%
    
    const finalChance = Math.min(baseChance + distanceBonus + edgeBonus, 0.8); // 最高 80%
    
    return finalChance;
  }

  /**
   * 根據位置選擇事件類型
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @returns {string} - 事件類型
   */
  selectRandomEventType(x, y) {
    // 根據位置區域選擇不同的事件類型
    const eventTypes = ['ddos', 'sql_injection', 'xss', 'csrf', 'brute_force'];
    
    // 邊界區域更容易觸發 DDoS
    const isEdge = x === 0 || x === 19 || y === 0 || y === 19;
    if (isEdge) {
      return Math.random() < 0.6 ? 'ddos' : eventTypes[Math.floor(Math.random() * eventTypes.length)];
    }
    
    // 其他區域隨機選擇
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

