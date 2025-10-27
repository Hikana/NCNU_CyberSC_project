const playerData = require('../models/playerData');
const shopData = require('../models/shopData');

// 與前端 IsoGrid 對齊的城堡座標（以 row,col = y,x）
const CASTLE_TILES = new Set([
    '0,0','0,1','0,2',
    '1,0','1,1','1,2',
    '2,0','2,1','2,2',
  ]);

class BuildingService {
  // 建築商店配置
  constructor() {}

  // 取得地圖狀態
  async getMapState(userId) {
    try {
      // 確保玩家存在（若不存在會自動初始化並建立 land 瓦片）
      await playerData.getPlayer(userId);
      const playerLand = await playerData.getPlayerLand(userId);

      // 以玩家 land 為唯一來源生成 20x20 地圖
      const mergedMap = Array.from({ length: 20 }, (_, y) =>
        Array.from({ length: 20 }, (_, x) => {
          const tileKey = `${x}_${y}`;
          const playerTileData = playerLand[tileKey];
          const isCastle = this.isCastleTile(y, x);

          // 任何情況下，城堡 3x3 一律固定為 developed/castle
          if (isCastle) {
            return {
              status: 'developed',
              type: 'castle',
              baseType: 'castle',
              buildingId: null,
              x,
              y
            };
          }

          if (playerTileData) {
            return {
              status: playerTileData.status,
              type: playerTileData.type || 'empty',
              baseType: playerTileData.baseType || playerTileData.type || 'empty',
              buildingId: playerTileData.buildingId ?? null,
              x,
              y
            };
          }

          return {
            status: 'locked',
            type: 'empty',
            baseType: 'empty',
            buildingId: null,
            x,
            y
          };
        })
      );

      return mergedMap;
    } catch (error) {
      console.error('取得地圖狀態失敗:', error);
      throw error;
    }
  }

  // 放置建築
  async placeBuilding(userId, buildingId, position) {
    try {
      const { x, y } = position;
      console.log('🔹 放置建築請求:', { userId, buildingId, position });
  
      // 1. 檢查建築是否存在（改從 Firestore 讀取）
      const buildingInfo = await shopData.getById(buildingId);
      if (!buildingInfo) throw new Error('找不到指定的建築');
  
      // 2. 取得玩家資料
      const player = await playerData.getPlayer(userId);
      console.log('🔹 玩家科技點:', player.techPoints, '建築需求:', buildingInfo.techCost);
  
      if (player.techPoints < buildingInfo.techCost) throw new Error('科技點不足');
  
      // 3. 取得地圖資料
      const mapData = await this.getMapState(userId);
      const targetTile = mapData[y]?.[x];
      console.log('🔹 目標 tile 狀態:', targetTile);
  
      if (!targetTile) throw new Error('無效的位置');
      if (targetTile.status !== 'developed') throw new Error('該位置無法放置建築');
  
      // 4. 城堡限制
      if (this.isCastleTile(y, x)) throw new Error('此區域為城堡，無法放置建築');
      console.log('🔹 城堡檢查通過');
  
      // 5. 扣除科技點
      await playerData.updatePlayer(userId, { techPoints: player.techPoints - buildingInfo.techCost });
  
      // 6. 更新地圖（同時寫入建築類型，前端可直接依據 type 顯示圖片）
      await playerData.updateTile(userId, x, y, {
        status: 'placed',
        buildingId,
        type: buildingInfo.type || 'host',
        placedAt: Date.now()
      });
  
      // 7. 返回更新後地圖
      const updatedMap = await this.getMapState(userId);
      console.log('✅ 建築放置成功');
      return updatedMap;
  
    } catch (error) {
      console.error('❌ placeBuilding 錯誤:', error.message);
      throw error;
    }
  }
  

  // 移除建築
  async removeBuilding(userId, position) {
    const { x, y } = position;
    
    // 檢查建築是否存在
    const mapData = await this.getMapState(userId);
    const targetTile = mapData[y]?.[x];
    
    if (!targetTile || targetTile.status !== 'placed') {
      throw new Error('該位置沒有建築');
    }
    
    // 更新地圖狀態為 developed
    await playerData.updateTile(userId, x, y, {
      status: 'developed',
      buildingId: null,
      removedAt: Date.now()
    });
    
    // 返回更新後的地圖
    return await this.getMapState(userId);
  }

  // 取得建築商店列表
  async getBuildingShop() {
    // 從 Firestore 讀取，若為空則回傳空陣列（由 seed 腳本或第一次使用時補種）
    const items = await shopData.getAllItems();
    return items;
  }

  // 取得建築資訊
  async getBuildingInfo(buildingId) {
    const item = await shopData.getById(Number(buildingId));
    return item;
  }

  // 檢查是否為城堡區域
  isCastleTile(row, col) {
    return CASTLE_TILES.has(`${row},${col}`);
  }
  
}

module.exports = new BuildingService();