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

  /**
   * 獲取或建立一個玩家的資料 (包含完整的預設欄位)
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<object>} 玩家的資料物件
   */
  async getPlayer(playerId) {
    const docRef = this.players.doc(playerId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // 依照你的最終藍圖，建立包含完整 eventCooldown 的預設玩家資料
      const newPlayerData = {
        castleLevel: 1,
        defense: 120,
        techPoints: 250,
        answeredCount: 0,
        developedCount: 0,
        itemCount: 0,
        orrectlyAnsweredIds: [], 
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
  
  
  /**
   * 更新玩家資料 (可用於增加/減少數值，或更新冷卻)
   * @param {string} playerId - 玩家 ID
   * @param {object} data - 要更新的資料，例如 { techPoints: FieldValue.increment(-100) }
   */
  async updatePlayer(playerId, data) {
    return this.players.doc(playerId).set(data, { merge: true });
  }
  async addCorrectlyAnsweredId(userId, questionId) {
  return this.players.doc(userId).update({
    correctlyAnsweredIds: FieldValue.arrayUnion(questionId)
  });
}

  // --- 背包 (Backpack) 相關 ---

  /**
   * 獲取玩家的整個背包
   * @param {string} playerId - 玩家 ID
   */
  async getPlayerBackpack(playerId) {
    const snapshot = await this.players.doc(playerId).collection('backpack').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 在玩家背包中新增或增加工具
   * @param {string} playerId - 玩家 ID
   * @param {string} toolId - 工具 ID
   * @param {object} toolData - 工具資料，例如 { name, forEvent }
   */
  async addToolToBackpack(playerId, toolId, toolData) {
    const toolRef = this.players.doc(playerId).collection('backpack').doc(toolId);
    return toolRef.set({
      ...toolData,
      count: FieldValue.increment(toolData.count || 1)
    }, { merge: true });
  }

  /**
   * 從玩家背包中使用/移除工具
   * @param {string} playerId - 玩家 ID
   * @param {string} toolId - 工具 ID
   */
  async useToolFromBackpack(playerId, toolId) {
    const toolRef = this.players.doc(playerId).collection('backpack').doc(toolId);
    const doc = await toolRef.get();
    if (doc.exists && doc.data().count > 1) {
      // 如果數量大於1，則減1
      return toolRef.update({ count: FieldValue.increment(-1) });
    } else {
      // 如果數量等於1或不存在，則直接刪除
      return toolRef.delete();
    }
  }

  // --- 土地 (Land) 相關 ---
  /**
   * 獲取這位玩家所有的土地瓦片資料
   */
  async getPlayerLand(playerId) {
    const snapshot = await this.land.doc(playerId).collection('tiles').get();
    const landData = {};
    snapshot.forEach(doc => { landData[doc.id] = doc.data(); });
    return landData;
  }

  /**
   * 更新某一塊特定土地瓦片的狀態
   */
  async updateTile(playerId, x, y, data) {
    const tileId = `${x}_${y}`;
    return this.land.doc(playerId).collection('tiles').doc(tileId).set(data, { merge: true });
  }

  // --- 商店 (Shop) & 成就 (Achievement) 相關 ---
  async getShopItems() {
    const snapshot = await this.shop.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getShopItem(itemId) {
    const doc = await this.shop.doc(itemId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async getAchievements() {
    const snapshot = await this.achievements.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = new PlayerData();

