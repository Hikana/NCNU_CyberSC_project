// backend/models/gameData.js

// 1. 從我們新建的 firebase.js 檔案中，引入已經初始化好的 db 和 FieldValue 物件
const { db, FieldValue } = require('../routes/firebase');

// 2. 以下所有 Firebase Admin 初始化相關的程式碼已全部移除，並移至 firebase.js

class GameData {
  constructor() {
    // 這裡維持不變，因為 db 已經是正確的實例了
    this.questionsCollection = db.collection('questions');
    this.db = db; // 把引入的 db 實例存為 this.db，讓 class 內所有函式都能存取

  }

  // --- 以下所有方法都維持我們之前優化過的版本，完全不需要改動 ---
  
  /**
   * 新增題目 (高效能版)
   */
  async addQuestion(questionData) {
    try {
      const category = questionData.category || 'misc';
      const level = questionData.level || 0;
      const timestamp = Date.now().toString().slice(-5);
      const q_code = `${category.toUpperCase()}-L${level}-${timestamp}`;

      const docRef = await this.questionsCollection.add({
        ...questionData,
        q_code: q_code,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        random: Math.random()
      });
      return { id: docRef.id, q_code: q_code };
    } catch (error) {
      console.error('Error adding question:', error);
      throw new Error('無法新增題目');
    }
  }

  /**
   * 統一的列表查詢模型
   */
  async findQuestions(filters) {
    let query = this.questionsCollection;
    if (filters.level) {
      query = query.where('level', '==', parseInt(filters.level));
    }
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 高效隨機查找題目
   */
  async findRandomQuestion({ level, excludeIds = [] }) {
    console.log(`[Data] findRandomQuestion 開始執行，收到的 excludeIds:`, excludeIds);
    try {
      let query = this.questionsCollection.where('level', '==', parseInt(level));
      
      // Firestore 的 'not-in' 查詢最多只支援 10 個元素的陣列
      if (excludeIds.length > 0 && excludeIds.length <= 10) {
        const admin = require('firebase-admin');
        query = query.where(admin.firestore.FieldPath.documentId(), 'not-in', excludeIds);
      }
      
      const random = Math.random();
      
      // 第一次嘗試: >=
      const snapshot = await query.where('random', '>=', random).limit(1).get();
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      
      // 第二次嘗試 (內部後備): <
      // 這次查詢會使用跟第一次完全相同的 query 條件 (包含 excludeIds)
      const fallbackSnapshot = await query.where('random', '<', random).limit(1).get();
      if (!fallbackSnapshot.empty) {
        return { id: fallbackSnapshot.docs[0].id, ...fallbackSnapshot.docs[0].data() };
      }

      // 如果兩次都找不到，代表真的沒有可選的題目了
      return null;

    } catch (error) {
      console.error('Error finding random question:', error);
      throw new Error('查找隨機題目時發生錯誤');
    }
  }
  

  /**
   * 一次性取得多個等級的指定數量題目
   */
  async findQuestionsByLevelMap(levelMap) {
    try {
      const queryPromises = Object.entries(levelMap).map(([level, count]) => {
        return this.questionsCollection.where('level', '==', parseInt(level)).limit(count * 2).get();
      });
      const snapshots = await Promise.all(queryPromises);
      let results = [];
      snapshots.forEach((snapshot, index) => {
        const count = Object.values(levelMap)[index];
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this._shuffleArray(docs);
        results.push(...docs.slice(0, count));
      });
      return results;
    } catch (error) {
      console.error('Error finding questions by level map:', error);
      throw new Error('查找關卡題目組合時發生錯誤');
    }
  }

  // --- 其他標準 CRUD 方法 ---
  async getQuestionById(questionId) {
    const doc = await this.questionsCollection.doc(questionId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
  
  async updateQuestion(questionId, questionData) {
    return this.questionsCollection.doc(questionId).update({
      ...questionData,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  async deleteQuestion(questionId) {
    return this.questionsCollection.doc(questionId).delete();
  }
  
  async clearAllQuestions() {
    const snapshot = await this.questionsCollection.limit(500).get();
    if (snapshot.empty) return;
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    if (snapshot.size === 500) await this.clearAllQuestions();
  }
  
  async getQuestionStats() {
      // 提醒：此方法在大量資料時有潛在效能問題
      const snapshot = await this.questionsCollection.get();
      const stats = { total: snapshot.size, byLevel: {}, byCategory: {} };
      snapshot.forEach(doc => {
          const q = doc.data();
          stats.byLevel[q.level] = (stats.byLevel[q.level] || 0) + 1;
          if (q.category) {
              stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
          }
      });
      return stats;
  }
  async getAllQuestions(){
    
  }
  // 輔助函式
  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  /**
     * 新增一筆答題紀錄到 'history' 集合
     * @param {object} historyEntry - 要儲存的紀錄物件
     * @returns {Promise<object>} - 回傳儲存後的物件，包含 Firestore 自動生成的 ID
     */
    async addHistoryEntry(historyEntry) {
        const docRef = await this.db.collection('history').add({
            ...historyEntry,
            timestamp: new Date() // 自動加上伺服器時間戳
        });
        return { id: docRef.id, ...historyEntry };
    }

    /**
     * 獲取所有答題紀錄，並按時間倒序排列
     * @returns {Promise<Array<object>>} - 包含所有紀錄的陣列
     */
    async getHistory() {
        const snapshot = await this.db.collection('history').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

module.exports = new GameData();