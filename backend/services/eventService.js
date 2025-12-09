// backend/services/eventService.js
const eventData = require('../models/eventData');
const buildingService = require('./buildingService');

// 與前端 IsoGrid 對齊的城堡座標（以 row,col = y,x）
const CASTLE_TILES = new Set([
  '0,0','0,1','0,2',
  '1,0','1,1','1,2',
  '2,0','2,1','2,2',
]);
const isCastleTile = (row, col) => CASTLE_TILES.has(`${row},${col}`);

class EventService {
  // --- 事件記錄相關（原有功能）---
  
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

  // --- 事件觸發系統

  /**
   * 事件基礎權重配置
   * 每個事件都有基礎權重，代表在完全沒防禦時的危險程度/出現頻率
   */
  getEventBaseWeights() {
    return {
      // Host 類事件
      brute_force: { baseWeight: 10, category: 'host' },
      supply_chain: { baseWeight: 8, category: 'public' },
      
      // Router 類事件
      unauthorized_access: { baseWeight: 10, category: 'router' },
      
      // 公網類事件
      ddos: { baseWeight: 12, category: 'public' },
      sql_injection: { baseWeight: 10, category: 'public' },
      xss: { baseWeight: 10, category: 'public' },
    };
  }

  /**
   * 獲取地圖統計資訊（Host/Router數量、防火牆覆蓋率）
   * @param {string} userId - 玩家 ID
   * @returns {object} 地圖統計資訊
   */
  async getMapStatistics(userId) {
    try {
      const map = await buildingService.getMapState(userId);
      
      let hostTotal = 0;
      let hostProtected = 0;
      let routerTotal = 0;
      let routerProtected = 0;
      let hasPublicFirewall = false;
      
      // 統計 Host 和 Router 數量及防火牆覆蓋
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          const cell = map[y][x];
          
          if (cell.status === 'placed') {
            // 檢查是否為 Host
            if (cell.type === 'host') {
              hostTotal++;
              if (cell.firewall === 'hf') {
                hostProtected++;
              }
            }
            // 檢查是否為 Router
            else if (cell.type === 'router') {
              routerTotal++;
              if (cell.firewall === 'nwf') {
                routerProtected++;
              }
            }
          }
          
          // 檢查主堡是否有 WAF（只需檢查一次）
          if (!hasPublicFirewall && isCastleTile(y, x) && cell.firewall === 'waf') {
            hasPublicFirewall = true;
          }
        }
      }
      
      // 計算覆蓋率
      const hostCoverage = hostTotal > 0 ? hostProtected / hostTotal : 0;
      const routerCoverage = routerTotal > 0 ? routerProtected / routerTotal : 0;
      
      return {
        hostTotal,
        hostProtected,
        hostCoverage,
        routerTotal,
        routerProtected,
        routerCoverage,
        hasPublicFirewall
      };
    } catch (error) {
      console.error('獲取地圖統計失敗:', error);
      return {
        hostTotal: 0,
        hostProtected: 0,
        hostCoverage: 0,
        routerTotal: 0,
        routerProtected: 0,
        routerCoverage: 0,
        hasPublicFirewall: false
      };
    }
  }

  /**
   * 檢查是否有 Router 連接到公網（Public Internet Tower）
   * @param {string} userId - 玩家 ID
   * @returns {boolean} 是否有 Router 連接到公網
   */
  async hasRouterConnectedToPublic(userId) {
    try {
      const connections = await buildingService.getConnections(userId);
      const map = await buildingService.getMapState(userId);
      
      // 檢查是否有連線從 Router 到 Castle（公網塔）
      for (const conn of connections) {
        const fromCell = map[conn.from.y]?.[conn.from.x];
        const toCell = map[conn.to.y]?.[conn.to.x];
        
        // 檢查是否為 Router -> Castle 或 Castle -> Router 的連線
        if ((fromCell?.type === 'router' && toCell?.type === 'castle') ||
            (fromCell?.type === 'castle' && toCell?.type === 'router')) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('檢查公網連線失敗:', error);
      return false;
    }
  }

  /**
   * 計算事件的當前權重（根據防火牆狀態調整）
   * @param {string} eventId - 事件 ID
   * @param {object} mapStats - 地圖統計資訊
   * @returns {number} 當前權重
   */
  calculateEventWeight(eventId, mapStats) {
    const eventWeights = this.getEventBaseWeights();
    const eventConfig = eventWeights[eventId];
    
    if (!eventConfig) {
      console.warn(`未知的事件 ID: ${eventId}`);
      return 0;
    }
    
    const { baseWeight, category } = eventConfig;
    let currentWeight = baseWeight;
    
    // 根據事件類別和防火牆狀態計算權重
    if (category === 'host') {
      // Host 類事件：CurrentWeight = BaseWeight × (1 - 0.8 × HostCoverage)
      currentWeight = baseWeight * (1 - 0.8 * mapStats.hostCoverage);
    } else if (category === 'router') {
      // Router 類事件：CurrentWeight = BaseWeight × (1 - 0.9 × RouterCoverage)
      currentWeight = baseWeight * (1 - 0.9 * mapStats.routerCoverage);
    } else if (category === 'public') {
      // 公網類事件：有 WAF 時權重 × 0.3，沒有時保持原樣
      if (mapStats.hasPublicFirewall) {
        currentWeight = baseWeight * 0.3;
      } else {
        currentWeight = baseWeight;
      }
    }
    
    // 確保權重不會是負數
    return Math.max(0, currentWeight);
  }

  /**
   * 建立候選事件清單（根據地圖狀態過濾）
   * @param {object} mapStats - 地圖統計資訊
   * @param {boolean} hasPublicConnection - 是否有 Router 連接到公網
   * @returns {Array} 候選事件列表 [{ eventId, category, ... }]
   */
  buildCandidateEvents(mapStats, hasPublicConnection) {
    const eventWeights = this.getEventBaseWeights();
    const candidates = [];
    
    for (const [eventId, config] of Object.entries(eventWeights)) {
      let shouldInclude = false;
      
      // 根據事件類別和前提條件決定是否加入候選清單
      if (config.category === 'host') {
        // Host 類事件：需要至少 1 台 Host
        shouldInclude = mapStats.hostTotal > 0;
      } else if (config.category === 'router') {
        // Router 類事件：需要至少 1 台 Router
        shouldInclude = mapStats.routerTotal > 0;
      } else if (config.category === 'public') {
        // 公網類事件：需要 Router 連接到公網
        shouldInclude = hasPublicConnection;
      }
      
      if (shouldInclude) {
        candidates.push({
          eventId,
          category: config.category,
          baseWeight: config.baseWeight
        });
      }
    }
    
    return candidates;
  }

  /**
   * 根據權重隨機選擇一個事件
   * @param {Array} candidates - 候選事件列表
   * @param {object} mapStats - 地圖統計資訊
   * @returns {string|null} 選中的事件 ID，如果沒有候選則返回 null
   */
  selectEventByWeight(candidates, mapStats) {
    if (candidates.length === 0) {
      return null;
    }
    
    // 計算每個候選事件的當前權重
    const weightedCandidates = candidates.map(candidate => ({
      ...candidate,
      currentWeight: this.calculateEventWeight(candidate.eventId, mapStats)
    }));
    
    // 計算總權重
    const totalWeight = weightedCandidates.reduce((sum, c) => sum + c.currentWeight, 0);
    
    if (totalWeight <= 0) {
      console.log('總權重為 0，不觸發任何事件');
      return null;
    }
    
    // 根據權重進行隨機選擇
    let randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const candidate of weightedCandidates) {
      cumulativeWeight += candidate.currentWeight;
      if (randomValue < cumulativeWeight) {
        console.log(`🎲 選中事件: ${candidate.eventId} (權重: ${candidate.currentWeight.toFixed(2)}/${totalWeight.toFixed(2)})`);
        return candidate.eventId;
      }
    }
    
    // 理論上不會執行到這裡，但為了安全起見返回最後一個
    return weightedCandidates[weightedCandidates.length - 1].eventId;
  }

  /**
   * 檢查是否觸發隨機事件
   * @param {string} userId - 玩家 ID
   * @param {object} position - 解鎖位置 { x, y }
   * @returns {object|null} - 觸發的事件資訊或 null
   */
  async checkForRandomEvent(userId, position) {
    try {
      const { x, y } = position;
      
      // 🚫 避免在 0-4*0-4 區域觸發事件
      if (x >= 0 && x <= 4 && y >= 0 && y <= 4) {
        return null;
      }
      
      // 🎲 固定觸發機率（每一格都是相同的機率）
      // 「觸發哪個事件」由後續的權重系統決定
      const triggerChance = 1; // 100% 固定機率（測試用，可改回 0.3 = 30%）
      const randomValue = Math.random();
      
      if (randomValue < triggerChance) {
        // 獲取地圖統計和連線狀態
        const mapStats = await this.getMapStatistics(userId);
        const hasPublicConnection = await this.hasRouterConnectedToPublic(userId);
        
        // 建立候選事件清單（根據前提條件篩選：有Host才能觸發Host類事件等）
        const candidates = this.buildCandidateEvents(mapStats, hasPublicConnection);
        
        if (candidates.length === 0) {
          console.log('沒有符合條件的事件候選，不觸發事件');
          return null;
        }
        
        // 根據權重選擇具體事件（在已確定要觸發的前提下）
        const eventType = this.selectEventByWeight(candidates, mapStats);
        
        if (!eventType) {
          return null;
        }
        
        const eventId = Date.now(); // 使用時間戳作為唯一ID
        
        return {
          id: eventId,
          type: eventType,
          position: { x, y },
          timestamp: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('檢查隨機事件失敗:', error);
      return null;
    }
  }
}

module.exports = new EventService();
