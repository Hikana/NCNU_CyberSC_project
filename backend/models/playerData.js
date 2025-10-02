// backend/models/playerData.js
const { db, FieldValue } = require('../config/firebase');

/**
 * PlayerData 類別
 * 職責：管理所有與玩家進度、土地、背包、商店等相關的資料庫操作。
 */
class PlayerData {
  constructor() {
    this.players = db.collection('players');
    this.land = db.collection('land');
    this.shop = db.collection('shop');
    this.events = db.collection('events');
    this.achievements = db.collection('achievement');
  }

  // --- 玩家 (Player) 相關 ---
  async getPlayer(playerId) {
    const docRef = this.players.doc(playerId);
    const doc = await docRef.get();

    if (!doc.exists) {
      const newPlayerData = {
        // 遊戲資料
        castleLevel: 1,
        defense: 120,
        techPoints: 500,
        
        // 座標
        x: 18,
        y: 5,
        position: {
          x: 0,
          y: 0
        },
        
        // 進度統計
        answeredCount: 0,
        developedCount: 0,
        itemCount: 0,
        
        // 答題記錄（只存這個，count 用這個計算）
        correctlyAnsweredIds: [],
        
        // 背包
        backpack: [],
        
        // 事件冷卻
        eventCooldown: {
          DDoS: 0, 
          SQLInjection: 0, 
          XSS: 0, 
          CSRF: 0, 
          BruteForce: 0,
          Phishing: 0, 
          MITM: 0, 
          Ransomware: 0, 
          PrivilegeEscalation: 0,
          SessionHijacking: 0, 
          DNSSpoofing: 0, 
          SupplyChain: 0
        },
        
        // 時間戳記
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await docRef.set(newPlayerData);
      console.log(`為新玩家 ${playerId} 建立了初始資料。`);
      
      return {
        ...newPlayerData,
        correctlyAnsweredCount: 0, // 計算出來的值
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    const data = doc.data();
    
    // 動態計算 correctlyAnsweredCount
    return {
      ...data,
      correctlyAnsweredCount: data.correctlyAnsweredIds?.length || 0
    };
  }

  async updatePlayer(playerId, data) {
    return this.players.doc(playerId).set(data, { merge: true });
  }

  async addCorrectlyAnsweredId(userId, questionId) {
    return this.players.doc(userId).update({
      correctlyAnsweredIds: FieldValue.arrayUnion(questionId)
    });
  }

  // --- 背包 (Backpack) 相關 → 使用你的版本 ---
  async getInventory(userId) {
    if (!userId) throw new Error('缺少 userId');
    const docRef = this.players.doc(userId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return [];
    }
    const data = snap.data() || {};
    return Array.isArray(data.backpack) ? data.backpack : [];
  }

  async setInventory(userId, items) {
    if (!userId) throw new Error('缺少 userId');
    if (!Array.isArray(items)) throw new Error('items 必須為陣列');
    const docRef = this.players.doc(userId);
    await docRef.set(
      { backpack: items, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return items;
  }

  // --- 土地 (Land) 相關 ---
  async getPlayerLand(playerId) {
    const snapshot = await this.land.doc(playerId).collection('tiles').get();
    const landData = {};
    snapshot.forEach(doc => { landData[doc.id] = doc.data(); });
    return landData;
  }

  async updateTile(playerId, x, y, data) {
    const tileId = `${x}_${y}`;
    return this.land.doc(playerId).collection('tiles').doc(tileId).set(data, { merge: true });
  }

  // --- 商店 (Shop) ---
  async getShopItems() {
    const snapshot = await this.shop.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getShopItem(itemId) {
    const doc = await this.shop.doc(itemId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  // --- 成就 (Achievement) ---
  async getAchievements() {
    const snapshot = await this.achievements.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = new PlayerData();
