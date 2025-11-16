// backend/services/eventService.js
const eventData = require('../models/eventData');

class EventService {
  // 獲取玩家的資安事件紀錄
  async getSecurityEvents(userId) {
    return eventData.getSecurityEvents(userId);
  }

  // 添加新的資安事件
  async addSecurityEvent(userId, eventPayload) {
    return eventData.addSecurityEvent(userId, eventPayload);
  }

  // 解決資安事件
  async resolveSecurityEvent(userId, eventId, usedItemId) {
    const result = await eventData.resolveSecurityEvent(userId, eventId, usedItemId);
    return result;
  }

  // 更新玩家資料
  async updatePlayerStats(userId, stats) {
    return eventData.updatePlayerStats(userId, stats);
  }
}

module.exports = new EventService();
