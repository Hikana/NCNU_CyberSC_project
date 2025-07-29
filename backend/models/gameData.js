// backend/models/gameData.js
const admin = require('firebase-admin');

// 確保只初始化一次 Firebase
if (!admin.apps.length) {
  const serviceAccount = require('../firebase/firebase-adminsdk.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();

class GameData {
  constructor() {
    this.questionsCollection = db.collection('questions');
  }

  // 取得所有題目
  async getAllQuestions() {
    try {
      const snapshot = await this.questionsCollection.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all questions:', error);
      throw new Error('無法取得題目資料');
    }
  }

  // 根據等級取得題目
  async getQuestionsByLevel(level) {
    try {
      const snapshot = await this.questionsCollection
        .where('level', '==', parseInt(level))
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching questions by level:', error);
      throw new Error(`無法取得等級 ${level} 的題目`);
    }
  }

  // 根據分類取得題目
  async getQuestionsByCategory(category) {
    try {
      const snapshot = await this.questionsCollection
        .where('category', '==', category)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      throw new Error(`無法取得分類 ${category} 的題目`);
    }
  }

  // 根據 ID 取得特定題目
  async getQuestionById(questionId) {
    try {
      const doc = await this.questionsCollection.doc(questionId).get();
      
      if (!doc.exists) {
        throw new Error('題目不存在');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching question by ID:', error);
      throw error;
    }
  }

  // 新增題目
async addQuestion(questionData) {
  try {
    // 先查詢現有題目數量，決定下一個題號
    const snapshot = await this.questionsCollection.get();
    const count = snapshot.size + 1; // 現有題目數量 +1
    
    // 生成題目 ID（例如 question01, question02）
    const questionId = `question${String(count).padStart(2, '0')}`;

    // 使用自訂 ID 新增文件
    await this.questionsCollection.doc(questionId).set({
      ...questionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return questionId;
  } catch (error) {
    console.error('Error adding question:', error);
    throw new Error('無法新增題目');
  }
}


  // 更新題目
  async updateQuestion(questionId, questionData) {
    try {
      await this.questionsCollection.doc(questionId).update({
        ...questionData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('無法更新題目');
    }
  }

  // 刪除題目
  async deleteQuestion(questionId) {
    try {
      await this.questionsCollection.doc(questionId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('無法刪除題目');
    }
  }
  async clearAllQuestions() {
        try {
            const snapshot = await this.questionsCollection.get();
            if (snapshot.empty) {
                console.log('Firestore 中沒有題目可清空。');
                return true;
            }

            const batch = db.batch(); // 使用批次寫入以提高效率
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref); // 將每個文件的刪除操作添加到批次中
            });
            await batch.commit(); // 提交所有批次操作
            console.log(`已從 Firestore 成功清空 ${snapshot.size} 題題目。`);
            return true;
        } catch (error) {
            console.error('Error clearing all questions from Firestore:', error);
            throw new Error('無法清空所有題目');
        }
    }

  // 取得題目統計
  async getQuestionStats() {
    try {
      const snapshot = await this.questionsCollection.get();
      const questions = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        total: questions.length,
        byLevel: {},
        byCategory: {},
        byDifficulty: {}
      };

      questions.forEach(q => {
        // 按等級統計
        stats.byLevel[q.level] = (stats.byLevel[q.level] || 0) + 1;
        
        // 按分類統計
        if (q.category) {
          stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
        }
        
        // 按難度統計
        if (q.difficulty) {
          stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting question stats:', error);
      throw new Error('無法取得題目統計');
    }
  }
}

module.exports = new GameData();