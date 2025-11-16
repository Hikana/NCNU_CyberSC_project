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
  async getPlayer(userId) {
    const docRef = this.players.doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      const newPlayerData = {
        castleLevel: 1,
        defense: 0,
        techPoints: 0,

        // 進度統計
        answeredCount: 0,
        eventResolvedCount: 0,
        developedCount: 0,
        itemCount: 0,
        connectToSwitchCount: 0,
        connectToRouterCount: 0,
        connectToInternetServerCount: 0,
        
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
      console.log(`為新玩家 ${userId} 建立了初始資料。`);
      
      // 初始化新玩家的地圖瓦片資料
      await this.initializePlayerLand(userId);
      
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

  async updatePlayer(userId, data) {
    try {
      return await this.players.doc(userId).update(data);
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
  
  // 初始化新玩家的地圖瓦片資料
  async initializePlayerLand(userId) {
    console.log(`開始為新玩家 ${userId} 初始化地圖瓦片資料...`);
    
    const batch = db.batch();
    const tilesCollection = this.land.doc(userId).collection('tiles');
    
    // 創建 20x20 的地圖瓦片
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        const tileId = `${x}_${y}`;
        const tileData = {
          x,
          y,
          type: 'empty',
          status: 'locked',
          buildingId: null,
        };
        
        // 設置城堡區域 (0,0)-(2,2) 為已開發狀態
        if (y <= 2 && x <= 2) {
          tileData.status = 'developed';
          tileData.type = 'castle';
          tileData.buildingId = null;
        }
        
        const tileRef = tilesCollection.doc(tileId);
        batch.set(tileRef, tileData);
      }
    }
    
    try {
      await batch.commit();
      console.log(`成功為玩家 ${userId} 初始化了 400 個地圖瓦片`);
    } catch (error) {
      console.error(`初始化玩家 ${userId} 地圖瓦片失敗:`, error);
      throw error;
    }
  }

  async getPlayerLand(userId) {
    const snapshot = await this.land.doc(userId).collection('tiles').get();
    const landData = {};
    snapshot.forEach(doc => { landData[doc.id] = doc.data(); });
    return landData;
  }

  async updateTile(userId, x, y, data) {
    const tileId = `${x}_${y}`;
    return this.land.doc(userId).collection('tiles').doc(tileId).set(data, { merge: true });
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
    console.log(`準備更新 Firestore: players/${userId}/achievements/${achievementId}`);
    console.log(`更新資料:`, updateData);
    
    const docRef = this.players.doc(userId).collection('achievements').doc(achievementId);
    const updatePayload = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    // 如果是領取獎勵，記錄領取時間
    if (updateData.status === 'finish') {
      updatePayload.claimedAt = Date.now();
      console.log(`成就已完成，記錄領取時間: ${updatePayload.claimedAt}`);
    }
    
    await docRef.set(updatePayload, { merge: true });
    
    const result = { id: achievementId, ...updatePayload };
    return result;
  }

  // --- 連線 (Connections) 相關 ---
  // 取得玩家的所有連線
  async getPlayerConnections(userId) {
    const snapshot = await this.players.doc(userId).collection('connections').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 添加新連線
  async addConnection(userId, connection) {
    const docRef = await this.players.doc(userId).collection('connections').add({
      ...connection,
      createdAt: FieldValue.serverTimestamp()
    });
    const newConnection = await docRef.get();
    return { id: docRef.id, ...newConnection.data() };
  }

  // 刪除連線
  async removeConnection(userId, connectionId) {
    await this.players.doc(userId).collection('connections').doc(connectionId).delete();
  }

  // 刪除與指定建築相關的所有連線
  async removeConnectionsByBuilding(userId, x, y) {
    const snapshot = await this.players.doc(userId).collection('connections')
      .where('from.x', '==', x).where('from.y', '==', y).get();
    
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }

    const snapshot2 = await this.players.doc(userId).collection('connections')
      .where('to.x', '==', x).where('to.y', '==', y).get();
    
    for (const doc of snapshot2.docs) {
      await doc.ref.delete();
    }
  }

  // 增加連線計數
  async incrementConnectToSwitchCount(userId) {
    return this.players.doc(userId).update({
      connectToSwitchCount: FieldValue.increment(1)
    });
  }

  async incrementConnectToRouterCount(userId) {
    return this.players.doc(userId).update({
      connectToRouterCount: FieldValue.increment(1)
    });
  }

  async incrementConnectToInternetServerCount(userId) {
    return this.players.doc(userId).update({
      connectToInternetServerCount: FieldValue.increment(1)
    });
  }
}

module.exports = new PlayerData();
