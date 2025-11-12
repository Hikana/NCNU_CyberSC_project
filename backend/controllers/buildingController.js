const buildingService = require('../services/buildingService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class BuildingController {
  constructor() {}

  // 取得地圖狀態
  getMap = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const mapData = await buildingService.getMapState(userId);
    res.status(200).json({ success: true, data: mapData });
  });

  // 放置建築
  placeBuilding = asyncHandler(async (req, res) => {
    try {
      const { buildingId, position } = req.body;
      const userId = req.user.uid;
      
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
    const userId = req.user.uid;
    
    const position = { x: parseInt(x), y: parseInt(y) };
    const result = await buildingService.removeBuilding(userId, position);
    res.status(200).json({ success: true, data: result });
  });

  // 架設防火牆
  placeFirewall = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { itemId, position } = req.body;
    if (!itemId || !position || position.x === undefined || position.y === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數：itemId 與 position'
      });
    }
    const result = await buildingService.placeFirewall(userId, Number(itemId), position);
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

  // --- 連線相關方法 ---
  // 取得玩家的連線列表
  getConnections = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const connections = await buildingService.getConnections(userId);
    res.status(200).json({ success: true, data: connections });
  });

  // 添加連線
  addConnection = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { connection } = req.body;
    
    if (!connection || !connection.from || !connection.to) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少連線資料' 
      });
    }

    const result = await buildingService.addConnection(userId, connection);
    res.status(200).json({ success: true, data: result });
  });

  // 刪除連線
  removeConnection = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { connectionId } = req.params;
    
    await buildingService.removeConnection(userId, connectionId);
    res.status(200).json({ success: true, message: '連線已刪除' });
  });
  
}

module.exports = new BuildingController();
