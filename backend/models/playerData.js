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
        castleLevel: 1,
        defense: 120,
        techPoints: 250,
        answeredCount: 0,
        developedCount: 0,
        itemCount: 0,
        correctlyAnsweredIds: [],
        eventCooldown: {
          DDoS: 0, SQLInjection: 0, XSS: 0, CSRF: 0, BruteForce: 0,
          Phishing: 0, MITM: 0, Ransomware: 0, PrivilegeEscalation: 0,
          SessionHijacking: 0, DNSSpoofing: 0, SupplyChain: 0
        }
      };
      await docRef.set(newPlayerData);
      console.log(`為新玩家 ${playerId} 建立了初始資料。`);
      return newPlayerData;
    }
    return doc.data();
  }

  async updatePlayer(playerId, data) {
    try {
      return await this.players.doc(playerId).update(data);
    } catch (error) {
      console.error('updatePlayer 錯誤:', error);
      throw error;
    }
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

  // 取得玩家成就進度
  async getPlayerAchievements(userId) {
    const snapshot = await this.players.doc(userId).collection('achievements').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 更新玩家成就狀態
  async updatePlayerAchievement(userId, achievementId, updateData) {
    console.log(`📝 準備更新 Firestore: players/${userId}/achievements/${achievementId}`);
    console.log(`📝 更新資料:`, updateData);
    
    const docRef = this.players.doc(userId).collection('achievements').doc(achievementId);
    const updatePayload = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    // 如果是領取獎勵，記錄領取時間
    if (updateData.status === 'finish') {
      updatePayload.claimedAt = Date.now();
      console.log(`🏆 成就已完成，記錄領取時間: ${updatePayload.claimedAt}`);
    }
    
    console.log(`📝 最終更新資料:`, updatePayload);
    await docRef.set(updatePayload, { merge: true });
    
    const result = { id: achievementId, ...updatePayload };
    console.log(`✅ Firestore 更新完成:`, result);
    return result;
  }
}

module.exports = new PlayerData();
