const { db, FieldValue } = require('../config/firebase');

const MAP_COLLECTION = 'gamemap';
const MAP_DOC_ID = 'main_world';

class BuildingData {
  constructor() {
    this.mapDocRef = db.collection(MAP_COLLECTION).doc(MAP_DOC_ID);
  }

  // 取得地圖基礎資料（不包含玩家建築）
  async getMap() {
    const doc = await this.mapDocRef.get();
    if (!doc.exists) {
      const newMap = Array.from({ length: 20 }, (_, y) => 
        Array.from({ length: 20 }, (_, x) => ({
          status: 'locked',
          type: 'empty',
          x,
          y
        }))
      );
      await this.mapDocRef.set({ tiles: newMap });
      return newMap;
    }
    const tiles = doc.data().tiles;
    
    // 如果是物件格式，轉換為二維陣列
    if (!Array.isArray(tiles) && typeof tiles === 'object') {
      const convertedMap = Array.from({ length: 20 }, (_, y) =>
        Array.from({ length: 20 }, (_, x) => {
          const cell = tiles[y]?.[x] || { type: 'empty' };
          return {
            ...cell,
            status: cell.status || 'locked',
            x,
            y
          };
        })
      );
      return convertedMap;
    }
    
    return tiles;
  }

  // 更新地圖基礎資料
  async updateMap(newMap) {
    return this.mapDocRef.update({ 
      tiles: newMap,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  // 初始化地圖（如果不存在）
  async initializeMap() {
    const doc = await this.mapDocRef.get();
    if (!doc.exists) {
      const newMap = Array.from({ length: 20 }, (_, y) => 
        Array.from({ length: 20 }, (_, x) => ({
          status: 'locked',
          type: 'empty',
          x,
          y,
          unlockCost: Math.floor(Math.random() * 100) + 50 // 隨機解鎖成本
        }))
      );
      
      // 設置城堡區域為 developed
      for (let y = 0; y <= 2; y++) {
        for (let x = 0; x <= 2; x++) {
          newMap[y][x] = {
            ...newMap[y][x],
            status: 'developed',
            type: 'castle'
          };
        }
      }
      
      await this.mapDocRef.set({ 
        tiles: newMap,
        createdAt: FieldValue.serverTimestamp()
      });
      return newMap;
    }
    return doc.data().tiles;
  }

  // 取得地圖統計資訊
  async getMapStats() {
    const mapData = await this.getMap();
    let stats = {
      total: 400,
      locked: 0,
      developed: 0,
      castle: 0
    };
    
    mapData.forEach(row => {
      row.forEach(cell => {
        if (cell.type === 'castle') stats.castle++;
        else if (cell.status === 'locked') stats.locked++;
        else if (cell.status === 'developed') stats.developed++;
      });
    });
    
    return stats;
  }
}

module.exports = new BuildingData();