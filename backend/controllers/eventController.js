// backend/controllers/eventController.js
const eventService = require('../services/eventService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class EventController {
  // 獲取玩家的資安事件紀錄
  getSecurityEvents = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const events = await eventService.getSecurityEvents(userId);
    res.status(200).json({ success: true, data: events });
  });

  // 添加新的資安事件
  addSecurityEvent = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const eventData = req.body;
    const savedEvent = await eventService.addSecurityEvent(userId, eventData);
    res.status(201).json({ success: true, data: savedEvent });
  });

  // 解決資安事件
  resolveSecurityEvent = asyncHandler(async (req, res) => {
    const { userId, eventId } = req.params;
    const { usedItemId } = req.body;
    const result = await eventService.resolveSecurityEvent(userId, eventId, usedItemId);
    res.status(200).json({ success: true, data: result });
  });

  // 更新玩家資料（科技點、防禦值）
  updatePlayerStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { techPoints, defense, answeredCount } = req.body;
    const result = await eventService.updatePlayerStats(userId, { techPoints, defense, answeredCount });
    res.status(200).json({ success: true, data: result });
  });
}

module.exports = new EventController();
