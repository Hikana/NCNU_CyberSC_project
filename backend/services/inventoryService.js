// backend/services/inventoryService.js
const inventoryData = require('../models/inventoryData');
const playerData = require('../models/playerData');
const { FieldValue } = require('../config/firebase');

class InventoryService {
  // 獲取玩家的背包
  async getInventory(userId) {
    return inventoryData.getInventory(userId);
  }

  // 添加物品到背包
  async addItem(userId, item) {
    return inventoryData.addItem(userId, item);
  }

  // 使用物品
  async useItem(userId, itemId) {
    return inventoryData.useItem(userId, itemId);
  }

  // 儲存整個背包
  async saveInventory(userId, items) {
    return inventoryData.saveInventory(userId, items);
  }

  // 使用防禦工具
  async useDefenseTool(userId, toolId) {
    try {
      
      // 獲取玩家資料
      const player = await playerData.getPlayer(userId);
      const defenseTools = player.defenseTools || {};
      
      // 檢查是否擁有該工具
      const currentQty = defenseTools[toolId] || 0;
      if (currentQty <= 0) {
        throw new Error(`你沒有 ${toolId} 這個防禦工具`);
      }
      
      // 扣除數量
      const updateData = {};
      if (currentQty === 1) {
        // 如果只有1個，刪除該欄位
        updateData[`defenseTools.${toolId}`] = FieldValue.delete();
      } else {
        // 否則減1
        updateData[`defenseTools.${toolId}`] = FieldValue.increment(-1);
      }
      
      // 更新玩家資料
      await playerData.updatePlayer(userId, updateData);
      
      
      return {
        success: true,
        toolId: toolId,
        remainingQty: Math.max(0, currentQty - 1),
        message: `成功使用防禦工具 ${toolId}`
      };
      
    } catch (error) {
      console.error('❌ 使用防禦工具失敗:', error);
      throw error;
    }
  }
}

module.exports = new InventoryService();
