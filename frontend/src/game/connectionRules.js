/**
 * 連線規則模組
 * 負責處理建築物之間的連線規則驗證和相關邏輯
 */

// 建築物類型定義（與商店數據保持一致）
export const BUILDING_TYPES = {
  // Host 建築（貓屋）
  1: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  2: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  3: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  5: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  6: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  7: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  11: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  12: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  13: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  14: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  15: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  16: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  17: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  18: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  19: { 
    name: '貓屋', 
    type: 'host', 
    maxConnections: 1, 
    description: '電腦 (Host) - 可發送或接收信件（資料），只能連一個設備' 
  },
  // Router 建築（郵局）
  101: { 
    name: '郵局', 
    type: 'router', 
    maxConnections: 10, 
    description: 'Router - 連接多個郵差站（不同LAN），建立區域網絡' 
  },
  // Switch 建築（郵筒）
  102: { 
    name: '郵筒', 
    type: 'switch', 
    maxConnections: 6, 
    description: 'Switch - 連接多個貓屋形成 LAN，提升資料傳送效率' 
  }
};

/**
 * 連線規則驗證器類別
 */
export class ConnectionValidator {
  constructor(map, connections) {
    this.map = map;
    this.connections = connections;
  }

  /**
   * 取得建築物類型
   * @param {number} buildingId - 建築物ID
   * @returns {Object|null} 建築物類型物件
   */
  getBuildingType(buildingId) {
    return BUILDING_TYPES[buildingId] || null;
  }

  /**
   * 取得建築物的連線
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {Array} 該建築物的所有連線
   */
  getBuildingConnections(x, y) {
    return this.connections.filter(conn => 
      (conn.from.x === x && conn.from.y === y) ||
      (conn.to.x === x && conn.to.y === y)
    );
  }

  /**
   * 檢查兩個建築物是否可以連線
   * @param {number} fromX - 起始建築物X座標
   * @param {number} fromY - 起始建築物Y座標
   * @param {number} toX - 目標建築物X座標
   * @param {number} toY - 目標建築物Y座標
   * @returns {Object} 驗證結果 {valid: boolean, reason: string}
   */
  canConnectBuildings(fromX, fromY, toX, toY) {
    const fromCell = this.map?.[fromY]?.[fromX];
    const toCell = this.map?.[toY]?.[toX];
    
    if (!fromCell || !toCell || 
        fromCell.status !== 'placed' || toCell.status !== 'placed' ||
        !fromCell.buildingId || !toCell.buildingId) {
      return { valid: false, reason: '建築物不存在或未放置' };
    }

    const fromType = this.getBuildingType(fromCell.buildingId);
    const toType = this.getBuildingType(toCell.buildingId);
    
    if (!fromType || !toType) {
      return { valid: false, reason: '未知的建築物類型' };
    }

    // 檢查連線數量限制
    const fromConnections = this.getBuildingConnections(fromX, fromY);
    const toConnections = this.getBuildingConnections(toX, toY);
    
    if (fromConnections.length >= fromType.maxConnections) {
      return { valid: false, reason: `${fromType.name} 已達到最大連線數 (${fromType.maxConnections})` };
    }
    
    if (toConnections.length >= toType.maxConnections) {
      return { valid: false, reason: `${toType.name} 已達到最大連線數 (${toType.maxConnections})` };
    }

    // 檢查連線規則
    const ruleCheck = this.validateConnectionRules(fromType, toType, fromConnections, toConnections);
    if (!ruleCheck.valid) {
      return ruleCheck;
    }

    return { valid: true };
  }

  /**
   * 驗證連線規則
   * @param {Object} fromType - 起始建築物類型
   * @param {Object} toType - 目標建築物類型
   * @param {Array} fromConnections - 起始建築物的連線
   * @param {Array} toConnections - 目標建築物的連線
   * @returns {Object} 驗證結果 {valid: boolean, reason: string}
   */
  validateConnectionRules(fromType, toType, fromConnections, toConnections) {
    // 規則1: Host 只能連一個設備（一張網卡概念）
    if (fromType.type === 'host') {
      if (fromConnections.length >= 1) {
        return { valid: false, reason: '貓屋只能連一個設備（一張網卡）' };
      }
      // Host 可以連 Host、Switch 或 Router
      return { valid: true };
    }

    if (toType.type === 'host') {
      if (toConnections.length >= 1) {
        return { valid: false, reason: '貓屋只能連一個設備（一張網卡）' };
      }
      // Host 可以連 Host、Switch 或 Router
      return { valid: true };
    }

    // 規則2: Switch 連 Host 的上限是4個
    if ((fromType.type === 'switch' && toType.type === 'host') ||
        (fromType.type === 'host' && toType.type === 'switch')) {
      // 檢查 Switch 已連接的 Host 數量
      const switchConnections = fromType.type === 'switch' ? fromConnections : toConnections;
      const hostCount = switchConnections.filter(conn => {
        const otherCell = this.map?.[conn.to.y]?.[conn.to.x] || this.map?.[conn.from.y]?.[conn.from.x];
        const otherType = this.getBuildingType(otherCell?.buildingId);
        return otherType?.type === 'host';
      }).length;
      
      if (hostCount >= 4) {
        return { valid: false, reason: '郵筒最多只能連4個貓屋' };
      }
      return { valid: true };
    }

    // 規則3: Switch 可以連接到 Router（無限制）
    if ((fromType.type === 'switch' && toType.type === 'router') ||
        (fromType.type === 'router' && toType.type === 'switch')) {
      return { valid: true };
    }

    // 規則4: Router 可以連接到任何設備
    if (fromType.type === 'router' || toType.type === 'router') {
      return { valid: true };
    }

    // 規則5: Switch 之間可以連接
    if (fromType.type === 'switch' && toType.type === 'switch') {
      return { valid: true };
    }

    // 其他情況不允許
    return { valid: false, reason: `不允許 ${fromType.name} 直接連接到 ${toType.name}` };
  }

  /**
   * 檢查連線是否已存在
   * @param {number} fromX - 起始X座標
   * @param {number} fromY - 起始Y座標
   * @param {number} toX - 目標X座標
   * @param {number} toY - 目標Y座標
   * @returns {boolean} 連線是否已存在
   */
  isConnectionExists(fromX, fromY, toX, toY) {
    return this.connections.some(conn => 
      (conn.from.x === fromX && conn.from.y === fromY && 
       conn.to.x === toX && conn.to.y === toY) ||
      (conn.from.x === toX && conn.from.y === toY && 
       conn.to.x === fromX && conn.to.y === fromY)
    );
  }

  /**
   * 移除特定連線
   * @param {number} fromX - 起始X座標
   * @param {number} fromY - 起始Y座標
   * @param {number} toX - 目標X座標
   * @param {number} toY - 目標Y座標
   * @returns {Array} 更新後的連線陣列
   */
  removeConnection(fromX, fromY, toX, toY) {
    return this.connections.filter(conn => 
      !(conn.from.x === fromX && conn.from.y === fromY && 
        conn.to.x === toX && conn.to.y === toY) &&
      !(conn.from.x === toX && conn.from.y === toY && 
        conn.to.x === fromX && conn.to.y === fromY)
    );
  }

  /**
   * 清除與特定位置相關的所有連線
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {Array} 更新後的連線陣列
   */
  clearConnectionsAt(x, y) {
    return this.connections.filter(conn => 
      !(conn.from.x === x && conn.from.y === y) &&
      !(conn.to.x === x && conn.to.y === y)
    );
  }

  /**
   * 取得網路狀態統計
   * @returns {Object} 網路狀態統計
   */
  getNetworkStatus() {
    const hosts = [];
    const switches = [];
    const routers = [];
    
    // 統計各類型建築物
    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        const cell = this.map[row][col];
        if (cell.status === 'placed' && cell.buildingId) {
          const buildingType = this.getBuildingType(cell.buildingId);
          if (buildingType) {
            const building = { 
              x: col, 
              y: row, 
              ...buildingType, 
              connections: this.getBuildingConnections(col, row) 
            };
            switch (buildingType.type) {
              case 'host': hosts.push(building); break;
              case 'switch': switches.push(building); break;
              case 'router': routers.push(building); break;
            }
          }
        }
      }
    }

    return { hosts, switches, routers, connections: this.connections };
  }
}

/**
 * 連線規則常數
 */
export const CONNECTION_RULES = {
  // Host 規則
  HOST_MAX_CONNECTIONS: 1,
  HOST_DESCRIPTION: '貓屋只能連一個設備（一張網卡）',
  
  // Switch 規則
  SWITCH_MAX_HOST_CONNECTIONS: 4,
  SWITCH_DESCRIPTION: '郵筒最多只能連4個貓屋',
  
  // Router 規則
  ROUTER_DESCRIPTION: '郵局可連任何設備，Host限制1個，其他不限',
  
  // 連線顏色配置
  CONNECTION_COLORS: {
    HOST_TO_HOST: 0xff6b6b,      // 紅色 - Host-Host (Peer-to-Peer)
    HOST_TO_SWITCH: 0x4ecdc4,     // 青色 - Host-Switch
    HOST_TO_ROUTER: 0xffa726,     // 橙色 - Host-Router
    SWITCH_TO_ROUTER: 0x45b7d1,   // 藍色 - Switch-Router
    ROUTER_TO_ROUTER: 0x96ceb4,   // 綠色 - Router-Router
    SWITCH_TO_SWITCH: 0x9c27b0,   // 紫色 - Switch-Switch
    DEFAULT: 0x00ff00             // 預設綠色
  }
};

/**
 * 取得連線顏色
 * @param {Object} fromType - 起始建築物類型
 * @param {Object} toType - 目標建築物類型
 * @returns {number} 顏色值
 */
export function getConnectionColor(fromType, toType) {
  const colors = CONNECTION_RULES.CONNECTION_COLORS;
  
  if (fromType.type === 'host' && toType.type === 'host') {
    return colors.HOST_TO_HOST;
  } else if ((fromType.type === 'host' && toType.type === 'switch') ||
             (fromType.type === 'switch' && toType.type === 'host')) {
    return colors.HOST_TO_SWITCH;
  } else if ((fromType.type === 'host' && toType.type === 'router') ||
             (fromType.type === 'router' && toType.type === 'host')) {
    return colors.HOST_TO_ROUTER;
  } else if ((fromType.type === 'switch' && toType.type === 'router') ||
             (fromType.type === 'router' && toType.type === 'switch')) {
    return colors.SWITCH_TO_ROUTER;
  } else if (fromType.type === 'router' && toType.type === 'router') {
    return colors.ROUTER_TO_ROUTER;
  } else if (fromType.type === 'switch' && toType.type === 'switch') {
    return colors.SWITCH_TO_SWITCH;
  }
  
  return colors.DEFAULT;
}

/**
 * 建立連線驗證器實例
 * @param {Array} map - 地圖資料
 * @param {Array} connections - 連線資料
 * @returns {ConnectionValidator} 連線驗證器實例
 */
export function createConnectionValidator(map, connections) {
  return new ConnectionValidator(map, connections);
}

/**
 * 預設匯出連線規則模組
 */
export default {
  BUILDING_TYPES,
  ConnectionValidator,
  CONNECTION_RULES,
  getConnectionColor,
  createConnectionValidator
};
