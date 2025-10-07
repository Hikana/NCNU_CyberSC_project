const buildingData = require('../models/buildingData');
const playerData = require('../models/playerData');

// 與前端 IsoGrid 對齊的城堡座標（以 row,col = y,x）
const CASTLE_TILES = new Set([
    '0,0','0,1','0,2',
    '1,0','1,1','1,2',
    '2,0','2,1','2,2',
  ]);

class BuildingService {
  // 建築商店配置
  constructor() {
    this.buildingShop = [
      { id: 1, name: '建築A', techCost: 50, defenseValue: 10 },
      { id: 2, name: '建築B', techCost: 60, defenseValue: 15 },
      { id: 3, name: '建築C', techCost: 70, defenseValue: 20 },
      { id: 5, name: '建築E', techCost: 90, defenseValue: 25 },
      { id: 6, name: '建築F', techCost: 90, defenseValue: 30 },
      { id: 7, name: '建築G', techCost: 90, defenseValue: 35 },
      { id: 11, name: '建築K', techCost: 120, defenseValue: 40 },
      { id: 12, name: '建築L', techCost: 120, defenseValue: 45 },
      { id: 13, name: '建築M', techCost: 140, defenseValue: 50 },
      { id: 14, name: '建築N', techCost: 150, defenseValue: 55 },
      { id: 15, name: '建築O', techCost: 160, defenseValue: 60 },
      { id: 16, name: '建築P', techCost: 180, defenseValue: 65 },
      { id: 17, name: '建築Q', techCost: 200, defenseValue: 70 },
      { id: 18, name: '建築R', techCost: 220, defenseValue: 75 },
      { id: 19, name: '建築S', techCost: 230, defenseValue: 80 }
    ];
  }

  // 取得地圖狀態
  async getMapState(userId) {
    try {
      // 初始化地圖（如果不存在）
      await buildingData.initializeMap();
      const mapData = await buildingData.getMap();
      const playerLand = await playerData.getPlayerLand(userId);
      
      // 確保 mapData 是二維陣列格式
      if (!Array.isArray(mapData)) {
        throw new Error('地圖資料不是陣列格式');
      }
      
      if (mapData.length === 0) {
        throw new Error('地圖資料是空陣列');
      }
      
      if (!Array.isArray(mapData[0])) {
        throw new Error('地圖資料不是二維陣列格式');
      }
      
      // 合併地圖資料和玩家土地資料
      const mergedMap = mapData.map((row, y) => 
        row.map((cell, x) => {
          const tileKey = `${x}_${y}`;
          const playerTileData = playerLand[tileKey];
          
          // 檢查是否為城堡區域
          const isCastle = this.isCastleTile(y, x);
          
          if (playerTileData) {
            // 玩家有個人資料，使用玩家的狀態
            return {
              ...playerTileData,
              baseType: cell.baseType, // 保留基礎類型            
              x,
              y
            };
          }
          
          // 玩家沒有個人資料，使用預設狀態
          return {
            status: isCastle ? 'developed' : 'locked',
            type: isCastle ? 'castle' : cell.baseType,
            baseType: cell.baseType,           
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
  
      // 1. 檢查建築是否存在
      const buildingInfo = this.buildingShop.find(b => b.id === buildingId);
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
  
      // 6. 更新地圖
      await playerData.updateTile(userId, x, y, {
        status: 'placed',
        buildingId,
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
    return this.buildingShop;
  }

  // 取得建築資訊
  async getBuildingInfo(buildingId) {
    return this.buildingShop.find(b => b.id == buildingId);
  }

  // 檢查是否為城堡區域
  isCastleTile(row, col) {
    return CASTLE_TILES.has(`${row},${col}`);
  }
  
}

module.exports = new BuildingService();