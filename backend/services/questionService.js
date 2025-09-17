// backend/services/questionService.js
const gameData = require('../models/gameData');

class QuestionService {
  // --- 統一的列表查詢 (已取代舊的 fetchAll, fetchByLevel, fetchByCategory) ---
  async fetchQuestions(filters = {}) {
    // 將過濾條件直接傳給 model 層處理
    return gameData.findQuestions(filters);
  }

  // --- 單一資源查詢 ---
  async fetchQuestionById(id) {
    const question = await gameData.getQuestionById(id);
    if (!question) throw new Error('找不到指定 ID 的題目');
    const { correctAnswer, ...questionData } = question; // 移除答案
    return questionData;
  }

  // --- 遊戲核心邏輯 ---
  async getRandomQuestion(level, userId) {
    // 專案暫不使用登入/用戶排除機制，統一走無用戶模式
    const question = await gameData.findRandomQuestion({ level });
    if (!question) throw new Error(`找不到等級 ${level} 的題目`);
    const { correctAnswer, ...data } = question;
    return data;
  }

  async getGameStageQuestions(stage) {
    const levelDistribution = this._getLevelDistribution(stage);
    const questions = await gameData.findQuestionsByLevelMap(levelDistribution);
    this._shuffleArray(questions);
    return questions.map(({ correctAnswer, ...q }) => q);
  }

  async validateAnswer(questionId, userAnswer) {
    const question = await gameData.getQuestionById(questionId);
    if (!question) {
      const err = new Error('無法驗證答案：找不到題目');
      err.status = 404;
      throw err;
    }
    if (typeof question.correctAnswer !== 'string') {
      const err = new Error('題目資料不完整：缺少正確答案');
      err.status = 422;
      throw err;
    }
    if (typeof userAnswer !== 'string') {
      const err = new Error('請提供有效的字串答案');
      err.status = 400;
      throw err;
    }

    const isCorrect = question.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
    return {
      isCorrect,
      correctAnswer: isCorrect ? undefined : question.correctAnswer,
      points: isCorrect ? (question.points || 10) : 0,
    };
  }

  async getQuestionHint(questionId) {
    const question = await gameData.getQuestionById(questionId);
    if (!question) throw new Error('無法取得提示：找不到題目');

    if (Array.isArray(question.options) && question.options.length > 2) {
      const wrongOptions = question.options.filter(opt => opt !== question.correctAnswer);
      return { type: 'remove_option', removedOption: wrongOptions[Math.floor(Math.random() * wrongOptions.length)] };
    }
    return { type: 'text_hint', hint: `答案的第一個字是「${question.correctAnswer.charAt(0)}」` };
  }

  calculateScore(correctAnswers, totalQuestions, timeSpent, hintsUsed = 0) {
    if (totalQuestions === 0) return 0;
    const baseScore = (correctAnswers / totalQuestions) * 10000;
    const timePenalty = Math.max(0, timeSpent - 180) * 5;
    const hintPenalty = hintsUsed * 50;
    return Math.max(0, Math.round(baseScore - timePenalty - hintPenalty));
  }
  
  // --- 管理功能 ---
  async createQuestion(questionData) { return gameData.addQuestion(questionData); }
  async updateQuestion(id, data) { return gameData.updateQuestion(id, data); }
  async deleteQuestion(id) { return gameData.deleteQuestion(id); }
  async clearAllQuestions() { return gameData.clearAllQuestions(); }
  async getQuestionStatistics() { return gameData.getQuestionStats(); }
 // --- 新增：答題紀錄相關服務 ---

  async createHistoryEntry(entryData) {
    // 在這裡可以做一些資料驗證或處理
    return gameData.addHistoryEntry(entryData);
  }

  async fetchHistory() {
    return gameData.getHistory();
  }

  // --- 輔助函式 ---
  _getLevelDistribution(stage) {
    const distributions = {
      1: { '1': 5 }, 2: { '1': 3, '2': 2 }, 3: { '1': 2, '2': 3 },
      4: { '2': 3, '3': 2 }, 5: { '2': 2, '3': 3 },
    };
    return distributions[stage] || { '1': 5 };
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

}

module.exports = new QuestionService();