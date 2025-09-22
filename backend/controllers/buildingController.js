/*
// backend/controllers/buildingController.js
let map = Array.from({ length: 20 }, () =>
    Array.from({ length: 20 }, () => ({ type: 'empty' }))
  );
  
  exports.placeBuilding = (req, res) => {
    const { buildingId, position } = req.body;
  
    console.log('收到建築放置請求:', { buildingId, position });
  
    // 檢查位置是否有效
    if (position.y < 0 || position.y >= 20 || position.x < 0 || position.x >= 20) {
      return res.status(400).json({ success: false, message: '位置超出地圖範圍' });
    }
  
    if (map[position.y][position.x].type !== 'empty') {
      return res.status(400).json({ success: false, message: '此位置已被佔用' });
    }
  
    map[position.y][position.x] = { type: 'building', buildingId };
  
    console.log('建築放置成功，更新地圖:', map);
  
    res.json({ success: true, map });
  };
  */  

const gameService = require('../services/gameService');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class BuildingController {
  constructor() {
    this.getUserId = (req) => req.query.userId || 'test-user';
  }

  // 地圖
  getMap = asyncHandler(async (req, res) => {
    const data = await gameService.getMapState(this.getUserId(req));
    res.status(200).json({ success: true, data });
  });

  // 放置建築
  placeBuilding = asyncHandler(async (req, res) => {
    const { buildingId, position } = req.body;
    const data = await gameService.placeBuilding(this.getUserId(req), buildingId, position);
    res.status(200).json({ success: true, data });
  });

  // 解鎖土地
  unlockTile = asyncHandler(async (req, res) => {
    const { position } = req.body;
    const data = await gameService.unlockTile(this.getUserId(req), position);
    res.status(200).json({ success: true, data });
  });

  // 清除建築（恢復 developed）
  clearBuilding = asyncHandler(async (req, res) => {
    const { position } = req.body;
    const data = await gameService.clearBuilding(this.getUserId(req), position);
    res.status(200).json({ success: true, data });
  });
}

module.exports = new BuildingController();
