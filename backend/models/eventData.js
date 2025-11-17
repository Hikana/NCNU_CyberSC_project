// backend/models/eventData.js
const { db, FieldValue } = require('../config/firebase');

/**
 * EventData 類別
 * 職責：管理所有與資安事件紀錄相關的資料庫操作
 */
class EventData {
  constructor() {
    this.players = db.collection('players');
  }

  // 獲取玩家的資安事件紀錄
  async getSecurityEvents(userId) {
    if (!userId) throw new Error('缺少 userId');
    
    const eventlogRef = this.players.doc(userId).collection('eventlog');
    const snapshot = await eventlogRef.orderBy('timestamp', 'desc').get();
    
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // 使用文件 ID 作為事件 ID
        eventId: data.eventId,
        eventName: data.eventName,
        timestamp: data.timestamp?.toDate() || new Date(),
        description: data.description,
        correctDefenses: data.correctDefenses,
        resolved: data.resolved || false,
        resolvedAt: data.resolvedAt?.toDate() || null,
        resolvedBy: data.resolvedBy || null
      };
    });
  }

  // 添加新的資安事件
  async addSecurityEvent(userId, eventData) {
    if (!userId) throw new Error('缺少 userId');
    
    
    const eventlogRef = this.players.doc(userId).collection('eventlog');
    
    // 處理時間戳：如果是 ISO 字串，轉換為 Date 物件
    let timestamp = new Date();
    if (eventData.timestamp) {
      timestamp = typeof eventData.timestamp === 'string' 
        ? new Date(eventData.timestamp) 
        : eventData.timestamp;
    }
    
    const eventDoc = {
      eventId: eventData.eventId,
      eventName: eventData.eventName,
      timestamp: timestamp,
      description: eventData.description,
      correctDefenses: eventData.correctDefenses,
      resolved: false
    };
    
    
    // 使用指定的 ID 作為文件 ID
    await eventlogRef.doc(eventData.id.toString()).set(eventDoc);
    
    // 回傳完整的資料結構，確保與前端期望一致
    const savedEvent = {
      id: eventData.id.toString(),
      eventId: eventDoc.eventId,
      eventName: eventDoc.eventName,
      timestamp: eventDoc.timestamp, // 保持為 Date 物件，讓前端處理
      description: eventDoc.description,
      correctDefenses: eventDoc.correctDefenses,
      resolved: false
    };
    
    return savedEvent;
  }

  // 解決資安事件
  async resolveSecurityEvent(userId, eventId, usedItemId) {
    if (!userId || !eventId || !usedItemId) {
      throw new Error('缺少必要參數');
    }
    
    const eventlogRef = this.players.doc(userId).collection('eventlog');
    const docRef = eventlogRef.doc(eventId.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error('找不到指定的事件');
    }
    
    const eventData = doc.data();
    
    // 檢查使用的道具是否為正確防禦
    const isCorrectDefense = eventData.correctDefenses.includes(usedItemId);
    
    if (isCorrectDefense) {
      // 解決後直接刪除該事件文件（不再顯示於清單）
      await docRef.delete();

      // 累積玩家已解決事件次數
      await this.players.doc(userId).set({ eventResolvedCount: FieldValue.increment(1) }, { merge: true });
      const snap = await this.players.doc(userId).get();
      const count = (snap.data()?.eventResolvedCount) || 0;

      return { success: true, message: '事件已成功解決並刪除', eventName: eventData.eventName, eventResolvedCount: count };
    } else {
      return { success: false, message: '使用的道具無法解決此事件' };
    }
  }

  // 更新玩家資料（科技點、防禦值等）
  async updatePlayerStats(userId, stats) {
    if (!userId) throw new Error('缺少 userId');
    
    const updateData = {};
    if (stats.techPoints !== undefined) updateData.techPoints = stats.techPoints;
    if (stats.defense !== undefined) updateData.defense = stats.defense;
    if (stats.answeredCount !== undefined) updateData.answeredCount = stats.answeredCount;
    
    await this.players.doc(userId).update(updateData);
    console.log('✅ 玩家資料已更新到資料庫');
    return updateData;
  }
}

module.exports = new EventData();
