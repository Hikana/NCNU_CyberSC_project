// backend/services/questionService.js
const gameData = require('../models/gameData');

class QuestionService {
  // 隨機取得題目（根據等級）
  async getRandomQuestion(level = 1, excludeIds = []) {
    try {
      const questions = await gameData.getQuestionsByLevel(level);
      
      if (questions.length === 0) {
        throw new Error(`找不到等級 ${level} 的題目`);
      }
      
      // 排除已經出過的題目
      const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));
      
      if (availableQuestions.length === 0) {
        // 如果所有題目都出過了，重新開始
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex];
      }
      
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      return availableQuestions[randomIndex];
    } catch (error) {
      console.error('Error in getRandomQuestion:', error);
      throw error;
    }
  }

  // 驗證答案
  async validateAnswer(questionId, userAnswer) {
    try {
      const question = await gameData.getQuestionById(questionId);
      
      const correctAnswer = question.correctAnswer.toLowerCase().trim();
      const userAnswerNormalized = userAnswer.toLowerCase().trim();
      
      const isCorrect = userAnswerNormalized === correctAnswer;
      
      return {
        isCorrect,
        correctAnswer: isCorrect ? null : question.correctAnswer, // 只在錯誤時返回正確答案
        points: isCorrect ? (question.points || 10) : 0,
        message: isCorrect ? '回答正確！' : '回答錯誤',
        question: question.question
      };
    } catch (error) {
      console.error('Error validating answer:', error);
      throw new Error('無法驗證答案');
    }
  }

  // 取得遊戲階段的題目組合
  async getGameStageQuestions(stage = 1, questionCount = 5) {
    try {
      // 根據階段決定題目等級分布
      const levelDistribution = this.getLevelDistribution(stage);
      const questions = [];
      
      for (const [level, count] of Object.entries(levelDistribution)) {
        const levelQuestions = await gameData.getQuestionsByLevel(parseInt(level));
        
        // 隨機選擇指定數量的題目
        const selectedQuestions = this.shuffleArray(levelQuestions).slice(0, count);
        questions.push(...selectedQuestions);
      }
      
      // 打亂題目順序
      return this.shuffleArray(questions);
    } catch (error) {
      console.error('Error getting game stage questions:', error);
      throw error;
    }
  }

  // 根據遊戲階段決定題目等級分布
  getLevelDistribution(stage) {
    const distributions = {
      1: { 1: 5 },                    // 第1關：5題等級1
      2: { 1: 3, 2: 2 },             // 第2關：3題等級1，2題等級2
      3: { 1: 2, 2: 3 },             // 第3關：2題等級1，3題等級2
      4: { 2: 3, 3: 2 },             // 第4關：3題等級2，2題等級3
      5: { 2: 2, 3: 3 },             // 第5關：2題等級2，3題等級3
    };
    
    return distributions[stage] || { 1: 5 }; // 預設返回等級1的5題
  }

  // 打亂陣列順序
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 取得題目提示（遊戲機制）
  async getQuestionHint(questionId) {
    try {
      const question = await gameData.getQuestionById(questionId);
      
      // 如果題目有選項，可以排除一些錯誤選項作為提示
      if (question.options && question.options.length > 2) {
        const correctAnswer = question.correctAnswer;
        const wrongOptions = question.options.filter(option => option !== correctAnswer);
        
        // 隨機移除一個錯誤選項
        const optionToRemove = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        
        return {
          type: 'remove_option',
          message: `提示：可以排除選項「${optionToRemove}」`,
          removedOption: optionToRemove
        };
      }
      
      // 如果沒有選項，提供文字提示
      return {
        type: 'text_hint',
        message: `提示：答案的第一個字是「${question.correctAnswer.charAt(0)}」`
      };
      
    } catch (error) {
      console.error('Error getting question hint:', error);
      throw new Error('無法取得題目提示');
    }
  }

  // 計算遊戲分數
  calculateScore(correctAnswers, totalQuestions, timeSpent, hintsUsed = 0) {
    const baseScore = correctAnswers * 100;
    const accuracyBonus = (correctAnswers / totalQuestions) * 50;
    const timeBonus = Math.max(0, 300 - timeSpent) * 2; // 5分鐘內完成有時間獎勵
    const hintPenalty = hintsUsed * 10; // 使用提示會扣分
    
    return Math.max(0, Math.round(baseScore + accuracyBonus + timeBonus - hintPenalty));
  }

  // 取得題目統計資訊
  async getQuestionStatistics() {
    try {
      return await gameData.getQuestionStats();
    } catch (error) {
      console.error('Error getting question statistics:', error);
      throw error;
    }
  }
}

module.exports = new QuestionService();