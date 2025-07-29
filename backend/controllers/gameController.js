// backend/controllers/gameController.js
const questionService = require('../services/questionService');
const gameData = require('../models/gameData');

class GameController {
  // 取得所有題目
  async getAllQuestions(req, res) {
    try {
      const questions = await gameData.getAllQuestions();
      res.json({
        success: true,
        data: questions,
        count: questions.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 根據等級取得題目
  async getQuestionsByLevel(req, res) {
    try {
      const { level } = req.params;
      const questions = await gameData.getQuestionsByLevel(level);
      
      res.json({
        success: true,
        data: questions,
        level: parseInt(level),
        count: questions.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 根據分類取得題目
  async getQuestionsByCategory(req, res) {
    try {
      const { category } = req.params;
      const questions = await gameData.getQuestionsByCategory(category);
      
      res.json({
        success: true,
        data: questions,
        category,
        count: questions.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 取得隨機題目
  async getRandomQuestion(req, res) {
    try {
      const { level = 1, exclude } = req.query;
      const excludeIds = exclude ? exclude.split(',') : [];
      
      const question = await questionService.getRandomQuestion(parseInt(level), excludeIds);
      
      // 不回傳正確答案給前端
      const { correctAnswer, ...questionData } = question;
      
      res.json({
        success: true,
        data: questionData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 取得遊戲階段題目
  async getStageQuestions(req, res) {
    try {
      const { stage } = req.params;
      const { count = 5 } = req.query;
      
      const questions = await questionService.getGameStageQuestions(
        parseInt(stage), 
        parseInt(count)
      );
      
      // 移除正確答案
      const questionsWithoutAnswers = questions.map(({ correctAnswer, ...q }) => q);
      
      res.json({
        success: true,
        data: questionsWithoutAnswers,
        stage: parseInt(stage),
        count: questionsWithoutAnswers.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 根據 ID 取得題目
  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await gameData.getQuestionById(id);
      
      // 不回傳正確答案
      const { correctAnswer, ...questionData } = question;
      
      res.json({
        success: true,
        data: questionData
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // 驗證答案
  async validateAnswer(req, res) {
    try {
      const { id } = req.params;
      const { answer } = req.body;
      
      if (!answer) {
        return res.status(400).json({
          success: false,
          message: '請提供答案'
        });
      }
      
      const result = await questionService.validateAnswer(id, answer);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 取得題目提示
  async getQuestionHint(req, res) {
    try {
      const { id } = req.params;
      const hint = await questionService.getQuestionHint(id);
      
      res.json({
        success: true,
        data: hint
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 計算分數
  async calculateScore(req, res) {
    try {
      const { correctAnswers, totalQuestions, timeSpent, hintsUsed = 0 } = req.body;
      
      if (correctAnswers === undefined || totalQuestions === undefined || timeSpent === undefined) {
        return res.status(400).json({
          success: false,
          message: '缺少必要參數'
        });
      }
      
      const score = questionService.calculateScore(
        correctAnswers, 
        totalQuestions, 
        timeSpent, 
        hintsUsed
      );
      
      res.json({
        success: true,
        data: {
          score,
          correctAnswers,
          totalQuestions,
          accuracy: Math.round((correctAnswers / totalQuestions) * 100),
          timeSpent,
          hintsUsed
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 取得題目統計
  async getQuestionStats(req, res) {
    try {
      const stats = await questionService.getQuestionStatistics();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 新增題目（管理員功能）
  async addQuestion(req, res) {
    try {
      const questionData = req.body;
      
      // 驗證必要欄位
      if (!questionData.question || !questionData.correctAnswer || !questionData.level) {
        return res.status(400).json({
          success: false,
          message: '缺少必要欄位：question, correctAnswer, level'
        });
      }
      
      const questionId = await gameData.addQuestion(questionData);
      
      res.status(201).json({
        success: true,
        data: { id: questionId },
        message: '題目新增成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 更新題目（管理員功能）
  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const questionData = req.body;
      
      await gameData.updateQuestion(id, questionData);
      
      res.json({
        success: true,
        message: '題目更新成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 刪除題目（管理員功能）
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      
      await gameData.deleteQuestion(id);
      
      res.json({
        success: true,
        message: '題目刪除成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async clearAllQuestions(req, res) {
      try {
        await gameData.clearAllQuestions(); // 調用 gameData 中的方法
        res.json({
          success: true,
          message: '所有題目已成功清空'
        });
      } catch (error) {
        console.error('Error in clearAllQuestions controller:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
}

module.exports = new GameController();