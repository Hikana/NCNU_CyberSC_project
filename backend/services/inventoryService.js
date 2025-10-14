// backend/services/inventoryService.js
const inventoryData = require('../models/inventoryData');

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
}

module.exports = new InventoryService();
