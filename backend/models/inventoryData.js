// backend/models/inventoryData.js
const { db, FieldValue } = require('../config/firebase');

/**
 * InventoryData 類別
 * 職責：管理所有與背包相關的資料庫操作
 */
class InventoryData {
  constructor() {
    this.players = db.collection('players');
  }

  // 獲取玩家的背包
  async getInventory(userId) {
    if (!userId) throw new Error('缺少 userId');
    
    const backpackRef = this.players.doc(userId).collection('backpack');
    const snapshot = await backpackRef.get();
    
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.itemId || doc.id,
        ...data
      };
    });
  }

  // 添加物品到背包
  async addItem(userId, item) {
    if (!userId) throw new Error('缺少 userId');
    
    const backpackRef = this.players.doc(userId).collection('backpack');
    
    // 檢查是否已存在相同物品
    const existingQuery = await backpackRef.where('itemId', '==', item.id).get();
    
    if (!existingQuery.empty) {
      // 更新現有物品數量
      const existingDoc = existingQuery.docs[0];
      const currentQty = existingDoc.data().qty || 0;
      await existingDoc.ref.update({ 
        qty: currentQty + (item.qty || 1),
        updatedAt: new Date()
      });
      console.log('✅ 物品數量已更新:', item.id);
    } else {
      // 新增物品
      await backpackRef.add({
        itemId: item.id,
        name: item.name,
        desc: item.desc,
        qty: item.qty || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ 新物品已加入背包:', item.id);
    }
    
    return { success: true, message: '物品已加入背包' };
  }

  // 使用物品（減少數量）
  async useItem(userId, itemId) {
    if (!userId || !itemId) throw new Error('缺少必要參數');
    
    const backpackRef = this.players.doc(userId).collection('backpack');
    const itemQuery = await backpackRef.where('itemId', '==', itemId).get();
    
    if (itemQuery.empty) {
      throw new Error('找不到指定物品');
    }
    
    const itemDoc = itemQuery.docs[0];
    const itemData = itemDoc.data();
    const currentQty = itemData.qty || 0;
    
    if (currentQty <= 0) {
      throw new Error('物品數量不足');
    }
    
    const newQty = currentQty - 1;
    
    if (newQty <= 0) {
      // 數量歸零，刪除物品
      await itemDoc.ref.delete();
      console.log('✅ 物品已用完並從背包移除:', itemId);
      return { success: true, message: '物品已用完', remainingQty: 0 };
    } else {
      // 更新數量
      await itemDoc.ref.update({ 
        qty: newQty,
        updatedAt: new Date()
      });
      console.log('✅ 物品數量已更新:', itemId, '剩餘:', newQty);
      return { success: true, message: '物品已使用', remainingQty: newQty };
    }
  }

  // 儲存整個背包
  async saveInventory(userId, items) {
    if (!userId) throw new Error('缺少 userId');
    
    const backpackRef = this.players.doc(userId).collection('backpack');
    
    // 清空現有背包
    const existingSnapshot = await backpackRef.get();
    const deletePromises = existingSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    // 新增所有物品
    const addPromises = items.map(item => {
      const { id, ...rest } = item;
      return backpackRef.add({
        itemId: id,
        ...rest,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await Promise.all(addPromises);
    console.log('✅ 背包已完全更新:', items.length, '個物品');
    
    return { success: true, message: '背包已儲存' };
  }
}

module.exports = new InventoryData();
