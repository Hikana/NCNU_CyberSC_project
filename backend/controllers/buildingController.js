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

const buildingService = require('../services/buildingService');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class BuildingController {
  getMap = asyncHandler(async (req, res) => {
    const mapData = await buildingService.getMapState();
    res.status(200).json({ success: true, map: mapData });
  });
  
  placeBuilding = asyncHandler(async (req, res) => {
    const { buildingId, position } = req.body;
    try {
      const updatedMap = await buildingService.placeBuilding(buildingId, position);
      res.status(200).json({ success: true, map: updatedMap });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
}

module.exports = BuildingController;
