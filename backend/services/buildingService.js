const playerData = require('../models/playerData');
const shopData = require('../models/shopData');

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

          if (isCastle) {
            return {
              status: 'placed',
              type: 'castle',
              buildingId: null,
              firewall: (playerTileData && playerTileData.firewall) ? playerTileData.firewall : null,
              x,
              y
            };
          }

          if (playerTileData) {
            return {
              status: playerTileData.status,
              type: playerTileData.type || 'empty',
              buildingId: playerTileData.buildingId ?? null,
              firewall: playerTileData.firewall ?? null,
              x,
              y
            };
          }

          return {
            status: 'locked',
            type: 'empty',
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
      console.log('放置建築請求:', { userId, buildingId, position });
  
      // 1. 檢查建築是否存在（改從 Firestore 讀取）
      const buildingInfo = await shopData.getById(buildingId);
      if (!buildingInfo) throw new Error('找不到指定的建築');
  
      // 2. 取得玩家資料
      const player = await playerData.getPlayer(userId);
      console.log('玩家科技點:', player.techPoints, '建築需求:', buildingInfo.techCost);
  
      if (player.techPoints < buildingInfo.techCost) throw new Error('科技點不足');
  
      // 3. 取得地圖資料
      const mapData = await this.getMapState(userId);
      const targetTile = mapData[y]?.[x];
      console.log('目標 tile 狀態:', targetTile);
  
      if (!targetTile) throw new Error('無效的位置');
      if (targetTile.status !== 'developed') throw new Error('該位置無法放置建築');
  
      // 4. 公網塔區域限制
      if (this.isCastleTile(y, x)) throw new Error('此區域為 Public Internet Tower，無法放置建築');``
  
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
      return await this.getMapState(userId);
  
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
    
    // 刪除與該建築相關的所有連線
    await playerData.removeConnectionsByBuilding(userId, x, y);
    
    // 更新地圖狀態為 developed
    await playerData.updateTile(userId, x, y, {
      status: 'developed',
      buildingId: null,
      removedAt: Date.now()
    });
    
    // 返回更新後的地圖
    return await this.getMapState(userId);
  }

  // 架設防火牆（依商店 item 判斷種類並扣點）
  async placeFirewall(userId, itemId, position) {
    const { x, y } = position;
    // 取得商店項目（含 techCost 與名稱）
    const shopItem = await shopData.getById(Number(itemId));
    if (!shopItem || shopItem.type !== 'firewall') {
      throw new Error('無效的防火牆項目');
    }
    // 解析種類
    const nameLower = (shopItem.name || '').toLowerCase();
    let kind = null;
    if (nameLower.includes('web') || nameLower.includes('waf')) kind = 'waf';
    else if (nameLower.includes('network') || nameLower.includes('nwf')) kind = 'nwf';
    else if (nameLower.includes('host') || nameLower.includes('hf')) kind = 'hf';
    if (!kind) throw new Error('未知的防火牆種類');

    // 取得玩家與地圖狀態
    const player = await playerData.getPlayer(userId);
    if (player.techPoints < (shopItem.techCost ?? 0)) throw new Error('科技點不足');
    const mapData = await this.getMapState(userId);
    const targetTile = mapData[y]?.[x];
    if (!targetTile) throw new Error('無效的位置');

    // 規則檢查
    // 允許依 tile.type 或 buildingId (由 shop 資料比對) 判斷類型，避免舊資料未寫入 type 的情況
    let placedType = targetTile.type || null;
    if (!placedType && targetTile.buildingId) {
      const placedInfo = await shopData.getById(Number(targetTile.buildingId));
      placedType = placedInfo?.type || null;
    }

    if (kind === 'hf') {
      if (!(targetTile.status === 'placed' && (placedType === 'host'))) {
        throw new Error('Host Firewall 只能架在主機 (Host) 上');
      }
    } else if (kind === 'nwf') {
      if (!(targetTile.status === 'placed' && (placedType === 'router'))) {
        throw new Error('Network Firewall 只能架在路由器 (Router) 上');
      }
    } else if (kind === 'waf') {
      if (!(targetTile.type === 'castle')) {
        throw new Error('WAF 只能架在 Public Internet Tower');
      }
    }

    // 扣除科技點
    await playerData.updatePlayer(userId, { techPoints: player.techPoints - (shopItem.techCost ?? 0) });

    // 寫入地塊 firewall 類型（持久化）
    // 特例：WAF → 同步整個城堡 3x3 狀態，且禁止重複架設
    if (kind === 'waf') {
      // 若任一城堡格已有 waf，禁止重複
      let castleHasWaf = false;
      for (let ry = 0; ry < 20; ry++) {
        for (let rx = 0; rx < 20; rx++) {
          if (this.isCastleTile(ry, rx)) {
            const cell = mapData[ry]?.[rx];
            if (String(cell?.firewall || '').toLowerCase() === 'waf') {
              castleHasWaf = true;
              break;
            }
          }
        }
        if (castleHasWaf) break;
      }
      if (castleHasWaf) {
        throw new Error('此建築已架設防火牆，不能重複架設');
      }
      // 同步九格
      const updates = [];
      for (let ry = 0; ry < 20; ry++) {
        for (let rx = 0; rx < 20; rx++) {
          if (this.isCastleTile(ry, rx)) {
            updates.push(playerData.updateTile(userId, rx, ry, { firewall: 'waf', updatedAt: Date.now() }));
          }
        }
      }
      await Promise.all(updates);
    } else {
      // 其他種類：僅更新目標格
      await playerData.updateTile(userId, x, y, { firewall: kind, updatedAt: Date.now() });
    }

    // 回傳最新地圖
    const updatedMap = await this.getMapState(userId);
    return updatedMap;
  }

  // --- 連線相關方法 ---
  // 取得玩家的連線列表
  async getConnections(userId) {
    return await playerData.getPlayerConnections(userId);
  }

  // 添加連線
  async addConnection(userId, connection) {
    // 新增連線
    const saved = await playerData.addConnection(userId, connection);

    try {
      const shopData = require('../models/shopData');
      const map = await this.getMapState(userId);
      const endpoints = [connection.from, connection.to];

      // 為兩端解析「連線對象類型」，帶有多重保險：type -> shop buildingId -> 空
      const types = await Promise.all(endpoints.map(async (p) => {
        const cell = map?.[p.y]?.[p.x];
        let t = cell?.type || null;
        if (!t && cell?.buildingId != null) {
          try {
            const info = await shopData.getById(Number(cell.buildingId));
            t = info?.type || null;
          } catch (_) {}
        }
        return t || 'empty';
      }));

      // 增加對應的計數（如果連線中任一端是目標類型就計數）
      if (types.includes('switch')) {
        await playerData.incrementConnectToSwitchCount(userId);
      }
      if (types.includes('router')) {
        await playerData.incrementConnectToRouterCount(userId);
      }
      if (types.includes('castle')) {
        await playerData.incrementConnectToInternetTowerCount(userId);
      }
    } catch (e) {
      console.warn('增加連線計數時發生錯誤（略過不中斷）:', e.message);
    }

    return saved;
  }

  // 刪除連線
  async removeConnection(userId, connectionId) {
    await playerData.removeConnection(userId, connectionId);
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