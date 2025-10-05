const buildingService = require('../services/buildingService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class BuildingController {
  constructor() {
    // 預設測試用玩家 ID
    this.getUserId = (req) => req.query.userId || req.body.userId || req.params.userId || 'test-user';
  }

  // 取得地圖狀態
  getMap = asyncHandler(async (req, res) => {
    const userId = req.query.userId || req.body.userId || req.params.userId || 'test-user';
    const mapData = await buildingService.getMapState(userId);
    res.status(200).json({ success: true, data: mapData });
  });

  // 放置建築
  placeBuilding = asyncHandler(async (req, res) => {
    try {
      const { buildingId, position } = req.body;
      const userId = req.query.userId || req.body.userId || req.params.userId || 'test-user';
      
      if (!buildingId || !position || position.x === undefined || position.y === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少必要參數：buildingId 和 position' 
        });
      }

      const result = await buildingService.placeBuilding(userId, buildingId, position);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('placeBuilding 錯誤:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || '建築放置失敗' 
      });
    }
  });

  // 移除建築
  removeBuilding = asyncHandler(async (req, res) => {
    const { x, y } = req.params;
    const userId = req.query.userId || req.body.userId || req.params.userId || 'test-user';
    
    const position = { x: parseInt(x), y: parseInt(y) };
    const result = await buildingService.removeBuilding(userId, position);
    res.status(200).json({ success: true, data: result });
  });

  // 取得建築商店列表
  getBuildingShop = asyncHandler(async (req, res) => {
    const shopItems = await buildingService.getBuildingShop();
    res.status(200).json({ success: true, data: shopItems });
  });

  // 取得建築資訊
  getBuildingInfo = asyncHandler(async (req, res) => {
    const { buildingId } = req.params;
    const buildingInfo = await buildingService.getBuildingInfo(buildingId);
    
    if (!buildingInfo) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到指定的建築' 
      });
    }
    
    res.status(200).json({ success: true, data: buildingInfo });
  });
}

module.exports = new BuildingController();
