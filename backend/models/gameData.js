const { db, FieldValue } = require('../config/firebase');


class GameData {
  constructor() {
    this.db = db;
    this.usersCollection = this.db.collection('players');
    this.questionsCollection = this.db.collection('questions');
    this.historyCollection = this.db.collection('history');
  }

  // --- 題目 (Question) 相關 ---
  async findRandomQuestion({ excludeIds = [] } = {}) {
    let query = this.questionsCollection;
    const snapshot = await query.limit(50).get();
    if (snapshot.empty) return null;
    
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const available = questions.filter(q => !excludeIds.includes(q.id));
    
    if (available.length === 0 && questions.length > 0) {
      return questions[Math.floor(Math.random() * questions.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }
  async addQuestion(questionData) {
    try {
      const category = questionData.category || 'misc';
      const timestamp = Date.now().toString().slice(-4);
      const randomNum = Math.floor(Math.random() * 100);
      const q_code = `${category.toUpperCase()}-${timestamp}${randomNum}`;

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

  async getQuestionById(id) {
    if (!id) {
      throw new Error('題目 ID 不能為空');
    }
    
    // 先嘗試用 Firestore docId 找
    const doc = await this.questionsCollection.doc(id.toString()).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  }

  // 如果不是 docId，改用自訂欄位 id 搜尋
  const snapshot = await this.questionsCollection.where("id", "==", Number(id)).limit(1).get();
  if (!snapshot.empty) {
    const foundDoc = snapshot.docs[0];
    return { id: foundDoc.id, ...foundDoc.data() };
  }

  return null;
}


  
  async getAllQuestions() {
    const snapshot = await this.questionsCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  

  /**
   * ✅ 新增這個方法給 upload.html 使用，用來刪除單一題目
   */
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



  // --- 使用者答題進度 (User) 相關 ---
  async getUser(userId) {
    const docRef = this.usersCollection.doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) {
      const newUser = { correctlyAnsweredIds: [] };
      await docRef.set(newUser);
      return newUser;
    }
    return doc.data();
  }

  async addCorrectlyAnsweredId(userId, questionId) {
    return this.usersCollection.doc(userId).set({
      correctlyAnsweredIds: FieldValue.arrayUnion(questionId)
    }, { merge: true });
  }

  
  // --- 歷史紀錄 (History) 相關 ---
   async getHistory(userId) {
    const snapshot = await this.historyCollection
                            .where("userId", "==", userId) // ✅ 關鍵的過濾條件
                            .orderBy('timestamp', 'desc')
                            .get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  async getUserHistory(userId) {
    const snapshot = await this.historyCollection
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  async addHistoryEntry(historyEntry) {
    // --- 監視器 1 ---
    // 檢查這個函式是否有被呼叫，以及它收到了什麼資料
    console.log("--- 準備寫入答題紀錄 ---");
    console.log("收到的資料:", historyEntry);

    try {
      const docRef = await this.historyCollection.add({
          ...historyEntry,
          timestamp: FieldValue.serverTimestamp()
      });
      const newEntry = await docRef.get();
      
      // --- 監視器 2 ---
      // 如果這行訊息出現，代表資料已成功寫入
      console.log(`✅ 答題紀錄成功寫入資料庫！文件 ID: ${docRef.id}`);

      return { id: docRef.id, ...newEntry.data() };

    } catch (error) {
      // --- 監視器 3 ---
      // 如果 Firebase 在寫入時發生任何錯誤，會在這裡顯示
      console.error("❌ 寫入答題紀錄時發生 Firestore 錯誤:", error);
      throw error; // 將錯誤繼續向上拋出，讓 Service 層知道
    }
  }

  async addHistoryEntryToSub(userId, historyEntry) {
    try {
      // ✅ 修正點：直接指向 'players' 集合
      const playerRef = db.collection('players').doc(userId); 
      const historyRef = playerRef.collection('history');

      const docRef = await historyRef.add({
        ...historyEntry,
        timestamp: FieldValue.serverTimestamp()
      });

      const newEntry = await docRef.get();
      return { id: docRef.id, ...newEntry.data() };

    } catch (error) {
      console.error("❌ 寫入子集合歷史紀錄失敗:", error);
      throw error;
    }
  }


  async getUserHistoryFromSub(userId) {
    const snapshot = await this.usersCollection
      .doc(userId)
      .collection("history")
      .orderBy("timestamp", "desc")
      .get();

    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  
  async updateQuestion(questionId, questionData) {
    return this.questionsCollection.doc(questionId).update({
      ...questionData,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

module.exports = new GameData();

