import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService'; // 引入我們統一的 apiService
import { BUILDING_TYPES, createConnectionValidator, getConnectionColor, INTERNET_TOWER_TYPE } from '@/game/connectionRules'; // 引入連線規則模組
import { audioService } from '@/services/audioService'; // 引入音頻服務
import routerImg from '@/assets/router.png';
import switchImg from '@/assets/switch.png';
import wafImg from '@/assets/WAF.png';
import nwfImg from '@/assets/NWF.png';
import hfImg from '@/assets/HF.png';

// 從 assets 引入圖片資源
import buildingAImg from '@/assets/B1.png'
import buildingBImg from '@/assets/B2.png'
import buildingCImg from '@/assets/B3.png'
import buildingEImg from '@/assets/B5.png'
import buildingFImg from '@/assets/B6.png'
import buildingGImg from '@/assets/B7.png'
import buildingKImg from '@/assets/B11.png'
import buildingLImg from '@/assets/B12.png'
import buildingMImg from '@/assets/B13.png'
import buildingNImg from '@/assets/B14.png'
import buildingOImg from '@/assets/B15.png'
import buildingPImg from '@/assets/B16.png'
import buildingQImg from '@/assets/B17.png'
import buildingRImg from '@/assets/B18.png'
import buildingSImg from '@/assets/B19.png'

// 修正 store 命名為複數
export const useBuildingStore = defineStore('buildings', {
  state: () => ({
    // map 的初始狀態改為空物件，等待從後端載入
    map: [],
    selectedTile: null,
    selectedBuildingId: null,
    isPlacing: false,
    deleteTarget: null,
    placementMessage: null,
    tileDevelopedMessage: null,
    castleInteraction: null,
    
    // 連線模式相關狀態
    isConnecting: false,
    connectionSource: null, // 連線的起始建築物位置
    connections: [], // 已建立的連線列表
    showConnections: false, // 是否顯示連線（默認隱藏，每次進入遊戲都從隱藏開始）
    
    // 刪除連線模式相關狀態
    isDeletingConnection: false,
    deleteConnectionTarget: null, // 要刪除連線的建築物位置
    connectionsToDelete: [], // 該建築的所有連線列表
    
    // 連線提示視窗狀態
    connectionModal: {
      isVisible: false,
      type: 'info', // 'success', 'error', 'info'
      title: '連線提示',
      message: '',
      showRules: false
    },
    
    // 商店建築列表：由後端載入
    shopBuildings: [],
    
    // 建築物類型定義（使用模組化的定義）
    buildingTypes: BUILDING_TYPES
  }),
  actions: {
    async loadShop() {
      try {
        // 從後端 API 取得 shop 清單
        const items = await apiService.getBuildingShop();
        const typeToImg = (item) => {
          if (item.type === 'router') return routerImg;
          if (item.type === 'switch') return switchImg;
          if (item.type === 'firewall') {
            const lower = (item.name || '').toLowerCase();
            if (lower.includes('web') || lower.includes('waf')) return wafImg;
            if (lower.includes('network') || lower.includes('nwf')) return nwfImg;
            if (lower.includes('host') || lower.includes('hf')) return hfImg;
            return wafImg;
          }
          // host：依 id 匹配原本圖片
          const map = {
            1: buildingAImg,
            2: buildingBImg,
            3: buildingCImg,
            5: buildingEImg,
            6: buildingFImg,
            7: buildingGImg,
            11: buildingKImg,
            12: buildingLImg,
            13: buildingMImg,
            14: buildingNImg,
            15: buildingOImg,
            16: buildingPImg,
            17: buildingQImg,
            18: buildingRImg,
            19: buildingSImg,
          };
          return map[item.id] || buildingAImg;
        };

        this.shopBuildings = (items || []).map((item) => ({
          id: item.id,
          name: item.name,
          techCost: item.techCost,
          defenseValue: item.defenseValue,
          type: item.type || 'host',
          img: typeToImg(item),
        }));
      } catch (e) {
        console.error('載入商店失敗:', e);
      }
    },
    // 新增：從後端載入地圖狀態的 action
    async loadMap() {
      try {
        const playerStore = usePlayerStore();
        const uid = playerStore.userId || playerStore.initFromAuth();
        
        if (!uid) {
          console.warn('⚠️ 無法載入地圖：使用者未登入');
          this.map = [];
          return;
        }
        
        const mapData = await apiService.getMap();
        
        // 確保 mapData 是正確的二維陣列格式
        if (Array.isArray(mapData) && Array.isArray(mapData[0])) {
          this.map = mapData;
        } else {
          console.error('地圖資料格式不正確:', mapData);
          // 建立預設地圖
          this.map = Array.from({ length: 20 }, (_, y) =>
            Array.from({ length: 20 }, (_, x) => ({ 
              status: 'locked', 
              type: 'empty',
              x, 
              y 
            }))
          );
        }
      } catch (error) {
        console.error('從後端載入地圖失敗:', error);
        
        // 檢查是否為認證錯誤
        if (error.message.includes('認證失敗') || error.message.includes('No token') || error.message.includes('用戶未登入')) {
          console.log('認證錯誤，請重新登入');
          this.map = [];
          return;
        }
        
        // 建立預設地圖作為備用
        this.map = Array.from({ length: 20 }, (_, y) =>
          Array.from({ length: 20 }, (_, x) => ({ 
            status: 'locked', 
            type: 'empty',
            x, 
            y 
          }))
        );
      }
    },

    // 取得目前欲放置的商店項目
    getSelectedShopItem() {
      if (!this.selectedBuildingId) return null;
      return (this.shopBuildings || []).find(i => i.id === this.selectedBuildingId) || null;
    },

    // 是否為防火牆放置模式
    isPlacingFirewall() {
      const item = this.getSelectedShopItem();
      return !!item && item.type === 'firewall';
    },

    // 目前選取的防火牆子型別：'waf' | 'nwf' | 'hf' | null
    getSelectedFirewallKind() {
      const item = this.getSelectedShopItem();
      if (!item || item.type !== 'firewall') return null;
      const n = (item.name || '').toLowerCase();
      if (n.includes('web') || n.includes('waf')) return 'waf';
      if (n.includes('network') || n.includes('nwf')) return 'nwf';
      if (n.includes('host') || n.includes('hf')) return 'hf';
      return 'firewall';
    },

    setPlacementMode(enabled, buildingId = null) {
      this.isPlacing = enabled;
      this.selectedBuildingId = buildingId;
      this.selectedTile = null;
    },
    startPlacing(buildingId) {
      this.selectedBuildingId = buildingId
      this.isPlacing = true
      this.selectedTile = null
    },
    selectTile(tileData) {
      if (this.isPlacing) {
        if (tileData === null) {
          this.selectedTile = null;
        } else {
          this.selectedTile = tileData;
        }
      }
    },
    clearSelectedTile() {
      this.selectedTile = null;
    },

    // 刪除建築 UI 狀態
    promptDelete(target) {
      this.deleteTarget = target; // { x, y, item }
    },
    cancelDeletePrompt() {
      this.deleteTarget = null;
    },

    // 放置限制訊息（UI 取代 alert）
    showPlacementMessage(message) {
      this.placementMessage = message;
      setTimeout(() => {
        if (this.placementMessage === message) this.placementMessage = null;
      }, 2500);
    },
    clearPlacementMessage() { this.placementMessage = null; },
    clearTileMessage() { this.tileDevelopedMessage = null; },
    showCastleInteraction() { this.castleInteraction = true; },
    hideCastleInteraction() { this.castleInteraction = null; },
    
    
    async confirmPlacement() {
      if (!this.selectedTile || !this.selectedBuildingId) {
        console.warn('無法確認放置：未選擇瓦片或建築');
        return;
      }

      const playerStore = usePlayerStore();

      // 防火牆放置：呼叫後端 API，扣除科技點並持久化 firewall 類型
      if (this.isPlacingFirewall()) {
        const { x, y } = this.selectedTile;
        try {
          const firewallKind = this.getSelectedFirewallKind?.();
          const response = await apiService.placeFirewall(this.selectedBuildingId, { x, y });

          if (response?.success && Array.isArray(response.updatedTiles)) {
            response.updatedTiles.forEach(tile => {
              const { position, ...tileData } = tile;
              if (position && this.map?.[position.y]) {
                this.map[position.y][position.x] = {
                  ...(this.map[position.y][position.x] || {}),
                  ...tileData
                };
              }
            });

            if (typeof response.remainingTechPoints === 'number') {
              playerStore.updatePlayerDataLocal({ techPoints: response.remainingTechPoints });
            } else {
              await playerStore.refreshPlayerData();
            }
          }

          // 重置 UI 狀態
          this.isPlacing = false;
          this.selectedTile = null;
          this.selectedBuildingId = null;

          const firewallMessages = {
            waf: '已建立 Web Application Firewall，可降低 DDoS、SQL Injection、XSS 攻擊風險。',
            nwf: '已建立 Network Firewall，可降低 Unauthorized Access 攻擊風險，強化網路邊界防護。',
            hf: '已建立 Host Firewall，可降低 Brute Force 攻擊風險，保護單一主機安全。'
          };
          const message = firewallMessages[firewallKind] ;
          this.showConnectionModal('success', '防火牆已建立', `${message}`, false);
          return;
        } catch (e) {
          console.error('架設防火牆失敗:', e);
          this.showPlacementMessage(e?.message );
          return;
        }
      }

      // 一般建築放置流程
      try {
        const response = await apiService.placeBuilding(
          this.selectedBuildingId,
          { x: this.selectedTile.x, y: this.selectedTile.y }
        );

        if (response?.success && response.updatedTile) {
          const { position, ...tileData } = response.updatedTile;
          if (Array.isArray(this.map) && this.map[position.y]) {
            this.map[position.y][position.x] = {
              ...(this.map[position.y][position.x] || {}),
              ...tileData
            };
          }

          if (typeof response.remainingTechPoints === 'number') {
            playerStore.updatePlayerDataLocal({ techPoints: response.remainingTechPoints });
          } else {
            await playerStore.refreshPlayerData();
          }

          this.isPlacing = false;
          this.selectedTile = null;
          this.selectedBuildingId = null;

          try {
            const { useAchievementStore } = await import('./achievement');
            const achievementStore = useAchievementStore();
            await new Promise(resolve => setTimeout(resolve, 100));
            await achievementStore.checkAllAchievements();
          } catch (e) {
            console.warn('刷新成就失敗（忽略）:', e);
          }
        } else {
          console.error('建築放置失敗:', response?.message || '未知錯誤');
        }
      } catch (err) {
        console.error('建築放置請求失敗:', err);
      }
    },
    
    // 購買建築（不扣科技點，只進入放置模式）
    buyBuilding(buildingItem) {
      console.log(`選擇建築 ${buildingItem.name}！`)
      this.setPlacementMode(true, buildingItem.id)
      return true
    },


    // 清除特定位置的建築
    async clearBuildingAt(x, y) {
      try {
        const response = await apiService.clearBuilding({ x, y });
        if (response?.success && response.updatedTile) {
          const { position, ...tileData } = response.updatedTile;
          if (position && this.map?.[position.y]) {
            this.map[position.y][position.x] = {
              ...(this.map[position.y][position.x] || {}),
              ...tileData
            };
          }
        } else {
          console.error('清除建築後的資料結構不正確:', response);
        }
        
        // 清除與該建築相關的所有連線
        this.connections = this.connections.filter(conn => 
          !(conn.from.x === x && conn.from.y === y) && 
          !(conn.to.x === x && conn.to.y === y)
        );
        
        console.log(`已清除位置 (${x}, ${y}) 的建築（後端同步）`);
        console.log(`已清除與該建築相關的連線，剩餘連線數量: ${this.connections.length}`);
        this.deleteTarget = null;
      } catch (e) {
        console.error('清除建築失敗:', e);
      }
    },

    // 連線相關方法
    startConnection(sourcePosition) {
      this.isConnecting = true;
      this.connectionSource = sourcePosition;
      console.log('開始連線模式，起始位置:', sourcePosition);
    },

    async completeConnection(targetPosition) {
      if (!this.isConnecting || !this.connectionSource) {
        console.warn('連線模式未啟動或缺少起始位置');
        return;
      }

      // 檢查是否為同一個建築物
      if (this.connectionSource.x === targetPosition.x && this.connectionSource.y === targetPosition.y) {
        console.log('不能連線到同一個建築物');
        this.showConnectionError('不能連線到同一個建築物');
        this.cancelConnection();
        return;
      }

      const canonicalServerPosition = this.getCanonicalCastlePosition();

      const normalizedTarget = this.normalizeTargetPosition(targetPosition);
      if (!normalizedTarget) {
        console.warn('無法解析目標位置');
        this.showConnectionError('目標建築不存在或已被移除');
        this.cancelConnection();
        return;
      }

      const isDestinationCastle = canonicalServerPosition &&
        normalizedTarget.x === canonicalServerPosition.x &&
        normalizedTarget.y === canonicalServerPosition.y;

      if (isDestinationCastle) {
        const sourceConnections = this.getBuildingConnections(this.connectionSource.x, this.connectionSource.y);
        const alreadyConnectedToCastle = sourceConnections.some(conn => {
          return (conn.to.x === canonicalServerPosition.x && conn.to.y === canonicalServerPosition.y) ||
                 (conn.from.x === canonicalServerPosition.x && conn.from.y === canonicalServerPosition.y);
        });

        if (alreadyConnectedToCastle) {
          this.showConnectionError('此 Router 已連 Public Internet Tower，無法重複連線');
          this.cancelConnection();
          return;
        }
      }

      // 使用連線規則模組檢查連線
      const validator = createConnectionValidator(this.map, this.connections);
      
      // 檢查是否已經存在相同的連線
      if (validator.isConnectionExists(this.connectionSource.x, this.connectionSource.y, normalizedTarget.x, normalizedTarget.y)) {
        console.log('連線已存在');
        this.showConnectionError('此連線已存在，無法重複建立');
        this.cancelConnection();
        return;
      }

      // 檢查連線是否已存在（本地檢查，作為備用）
      const connectionExists = this.connections.some(conn => 
        (conn.from.x === this.connectionSource.x && conn.from.y === this.connectionSource.y && 
         conn.to.x === normalizedTarget.x && conn.to.y === normalizedTarget.y) ||
        (conn.from.x === normalizedTarget.x && conn.from.y === normalizedTarget.y && 
         conn.to.x === this.connectionSource.x && conn.to.y === this.connectionSource.y)
      );

      if (connectionExists) {
        console.log('連線已存在');
        this.showConnectionError('此連線已存在，無法重複建立');
        this.cancelConnection();
        return;
      }

      // 驗證連線規則
      const validation = validator.canConnectBuildings(this.connectionSource.x, this.connectionSource.y, normalizedTarget.x, normalizedTarget.y);
      if (!validation.valid) {
        console.log('連線規則驗證失敗:', validation.reason);
        this.showConnectionError(validation.reason);
        this.cancelConnection();
        return;
      }

      try {
        const sourcePosition = this.connectionSource ? { ...this.connectionSource } : null;
        if (!sourcePosition) {
          console.warn('連線來源不存在，無法完成連線');
          this.showConnectionError('來源建築不存在或已被移除');
          this.cancelConnection();
          return;
        }

        const sourceRow = sourcePosition.y;
        const sourceCol = sourcePosition.x;
        if (!this.map?.[sourceRow]?.[sourceCol]) {
          console.warn('找不到來源建築在地圖上的資料');
          this.showConnectionError('來源建築不存在或已被移除');
          this.cancelConnection();
          return;
        }

        // 添加新連線到後端
        const targetRow = normalizedTarget.y;
        const targetCol = normalizedTarget.x;
        const targetCell = this.map?.[targetRow]?.[targetCol];
        if (!targetCell) {
          console.warn('找不到目標建築在地圖上的資料');
          this.showConnectionError('目標建築不存在或已被移除');
          this.cancelConnection();
          return;
        }

        const newConnection = {
          from: sourcePosition,
          to: { ...normalizedTarget }
        };

        const savedConnection = await apiService.addConnection(newConnection);
        const normalizedSavedConnection = this.normalizeConnectionEndpoints(savedConnection) || newConnection;
        console.log('連線已保存到後端:', savedConnection);

        // 添加到本地狀態
        this.connections.push(normalizedSavedConnection);
        console.log('本地連線列表已更新');
        
        // 自動開啟連線顯示模式，讓用戶可以直接看到剛建立好的連線
        this.showConnections = true;
        localStorage.setItem('showConnections', 'true');
        
        // 顯示連線成功提示
        const fromCell = this.map[sourceRow][sourceCol];
        const toCell = targetCell;
        const fromType = this.resolveCellType(fromCell);
        const toType = this.resolveCellType(toCell);
        // 從地圖中獲取建築類型（host、switch、router）
        const fromBuildingType = fromCell.type || (fromType?.type || 'host');
        const toBuildingType = (toCell?.type) || (toType?.type || 'host');
        this.showConnectionSuccess(fromType, toType, fromBuildingType, toBuildingType);
        
        // 刷新玩家資料以更新連線計數
        try {
          const { usePlayerStore } = await import('./player');
          const playerStore = usePlayerStore();
          await playerStore.loadPlayerData();
          
          // 檢查成就（連線成功後）
          try {
            const { useAchievementStore } = await import('./achievement');
            const achievementStore = useAchievementStore();
            await achievementStore.checkAllAchievements();
          } catch (e) {
            console.warn('檢查成就失敗（忽略）:', e);
          }
        } catch (e) {
          console.warn('刷新玩家資料失敗（忽略）:', e);
        }
        
        // 嘗試刷新成就
        try {
          const { useAchievementStore } = await import('./achievement');
          const achievementStore = useAchievementStore();
          achievementStore.loadAchievements();
        } catch (e) {
          console.warn('刷新成就失敗（忽略）:', e);
        }
        
      } catch (error) {
        console.error('保存連線失敗:', error);
        // 檢查是否為重複連線錯誤
        const errorMessage = error?.message || error?.toString() || '';
        if (errorMessage.includes('已存在') || errorMessage.includes('重複')) {
          this.showConnectionError('此連線已存在，無法重複建立');
        } else {
          this.showConnectionError('保存連線失敗，請重試');
        }
      }
      
      this.cancelConnection();
    },

    // 從後端載入連線
    async loadConnections() {
      try {
        const connections = await apiService.getConnections();
        this.connections = (connections || [])
          .map(conn => this.normalizeConnectionEndpoints(conn))
          .filter(Boolean);
        console.log('已載入連線:', connections.length, '條');
      } catch (error) {
        console.error('載入連線失敗:', error);
        this.connections = [];
      }
    },

    cancelConnection() {
      this.isConnecting = false;
      this.connectionSource = null;
    },

    removeConnection(connectionId) {
      this.connections = this.connections.filter(conn => conn.id !== connectionId);
    },

    async removeConnectionById(connectionId) {
      try {
        // 從後端刪除連線
        await apiService.removeConnection(connectionId);
        // 從本地狀態刪除連線
        this.connections = this.connections.filter(conn => conn.id !== connectionId);
        console.log('連線已刪除:', connectionId);
      } catch (error) {
        console.error('刪除連線失敗:', error);
      }
    },

    // 切換連線顯示/隱藏
    toggleConnections() {
      this.showConnections = !this.showConnections;
      localStorage.setItem('showConnections', this.showConnections.toString());
      console.log('連線顯示狀態:', this.showConnections ? '顯示' : '隱藏');
      // 如果關閉連線顯示，清除選中狀態
      if (!this.showConnections) {
        this.selectedConnectionId = null;
      }
    },

    // 選中連線並顯示
    selectConnection(connectionId) {
      this.selectedConnectionId = connectionId;
      this.showConnections = true;
      console.log('選中連線:', connectionId);
    },

    focusConnection(connectionOrId) {
      if (!connectionOrId) return;
      const targetConnection = typeof connectionOrId === 'string'
        ? this.connections.find(conn => conn.id === connectionOrId)
        : connectionOrId;

      if (!targetConnection) return;

      this.selectConnection(targetConnection.id);

      const centerX = (Number(targetConnection.from?.x) + Number(targetConnection.to?.x)) / 2;
      const centerY = (Number(targetConnection.from?.y) + Number(targetConnection.to?.y)) / 2;

      if (Number.isNaN(centerX) || Number.isNaN(centerY)) return;

      const TILE_SIZE = 150;
      const halfW = TILE_SIZE / 2;
      const halfH = TILE_SIZE / 4;
      const isoX = (centerX - centerY) * halfW;
      const isoY = (centerX + centerY) * halfH;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('moveToPosition', {
          detail: { x: isoX, y: isoY }
        }));
      }
    },

    // 清除選中連線
    clearSelectedConnection() {
      this.selectedConnectionId = null;
    },

    // 連線規則相關方法
    getBuildingType(buildingId) {
      return this.buildingTypes[buildingId] || null;
    },

    resolveCellType(cell) {
      if (!cell) return null;
      if (cell.buildingId) {
        return this.getBuildingType(cell.buildingId);
      }
      if (cell.type === 'castle') {
        return INTERNET_TOWER_TYPE;
      }
      return null;
    },

    getCastleTiles() {
      const tiles = [];
      if (!Array.isArray(this.map)) return tiles;
      for (let row = 0; row < this.map.length; row++) {
        const rowData = this.map[row];
        if (!Array.isArray(rowData)) continue;
        for (let col = 0; col < rowData.length; col++) {
          const cell = rowData[col];
          if (cell && cell.type === 'castle') {
            tiles.push({ x: col, y: row });
          }
        }
      }
      return tiles;
    },

    getCanonicalCastlePosition() {
      const tiles = this.getCastleTiles();
      if (tiles.length === 0) return null;
      tiles.sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
      });
      return { ...tiles[Math.floor(tiles.length / 2)] };
    },

    normalizePosition(position) {
      if (!position || typeof position.x === 'undefined' || typeof position.y === 'undefined') return null;
      const x = Number(position.x);
      const y = Number(position.y);
      if (Number.isNaN(x) || Number.isNaN(y)) return null;
      return { x, y };
    },

    normalizeTargetPosition(position) {
      const base = this.normalizePosition(position);
      if (!base) return null;
      const cell = this.map?.[base.y]?.[base.x];
      if (cell && cell.type === 'castle') {
        const canonical = this.getCanonicalCastlePosition();
        if (canonical) {
          return canonical;
        }
      }
      return base;
    },

    normalizeConnectionEndpoints(connection) {
      if (!connection) return null;
      const normalizedFrom = this.normalizeTargetPosition(connection.from) || this.normalizePosition(connection.from);
      const normalizedTo = this.normalizeTargetPosition(connection.to) || this.normalizePosition(connection.to);
      if (!normalizedFrom || !normalizedTo) return null;
      return {
        ...connection,
        from: normalizedFrom,
        to: normalizedTo
      };
    },

    getBuildingConnections(x, y) {
      return this.connections.filter(conn => 
        (conn.from.x === x && conn.from.y === y) ||
        (conn.to.x === x && conn.to.y === y)
      );
    },

    getNetworkStatus() {
      const validator = createConnectionValidator(this.map, this.connections);
      return validator.getNetworkStatus();
    },

    // 連線視窗相關方法
    showConnectionModal(type, title, message, showRules = false) {
      this.connectionModal = {
        isVisible: true,
        type,
        title,
        message,
        showRules
      };
    },

    hideConnectionModal() {
      this.connectionModal.isVisible = false;
    },

    async showConnectionSuccess(fromType, toType, fromBuildingType = null, toBuildingType = null) {
      // 獲取建築類型顯示名稱
      const getTypeDisplayName = (type) => {
        const typeMap = {
          'host': 'Host',
          'switch': 'Switch',
          'router': 'Router',
          'castle': 'Public Internet Tower',
          'firewall': 'Firewall'
        };
        return typeMap[type] || type;
      };
      
      const formatDisplayName = (type) => {
        if (!type) return '未知建築';
        if (type.type === 'castle') return '公網塔';
        return type.name || '未知建築';
      };

      const fromTypeName = formatDisplayName(fromType);
      const toTypeName = formatDisplayName(toType);
      const fromTypeLabel = fromBuildingType ? ` (${getTypeDisplayName(fromBuildingType)})` : '';
      const toTypeLabel = toBuildingType ? ` (${getTypeDisplayName(toBuildingType)})` : '';
      
      // 判斷連線類型並提供網路概念說明
      const getNetworkConcept = (fromType, toType, fromBuildingType, toBuildingType) => {
        const fromTypeStr = fromBuildingType || fromType?.type || '';
        const toTypeStr = toBuildingType || toType?.type || '';
        
        // Host ↔ Switch: 建立 LAN（區域網路）
        if ((fromTypeStr === 'host' && toTypeStr === 'switch') || 
            (fromTypeStr === 'switch' && toTypeStr === 'host')) {
          return {
            concept: 'LAN (區域網路)',
            description: '你建立了一個 LAN！Switch 可以連接多個 Host，形成一個區域網路，讓同一區域內的設備可以互相通訊。'
          };
        }
        
        // Switch ↔ Router: 連接不同 LAN，形成 WAN 的一部分
        if ((fromTypeStr === 'switch' && toTypeStr === 'router') || 
            (fromTypeStr === 'router' && toTypeStr === 'switch')) {
          return {
            concept: 'WAN (廣域網路)',
            description: '你建立了 WAN 連線！Router 連接不同的 LAN，讓不同區域的網路可以互相通訊，形成更大的網路架構。'
          };
        }
        
        // Router ↔ Public Internet Tower: 建立網際網路連線
        if ((fromTypeStr === 'router' && toTypeStr === 'castle') || 
            (fromTypeStr === 'castle' && toTypeStr === 'router')) {
          return {
            concept: '網際網路連線',
            description: '你建立了網際網路連線！Router 連接到 Public Internet Tower，讓你的區域網路可以連接到全球網際網路。'
          };
        }
        
        // Host ↔ Router: 直接連接到路由器
        if ((fromTypeStr === 'host' && toTypeStr === 'router') || 
            (fromTypeStr === 'router' && toTypeStr === 'host')) {
          return {
            concept: '直接路由器連線',
            description: '你建立了直接路由器連線！Host 直接連接到 Router，可以透過路由器訪問其他網路。'
          };
        }
        
        // Switch ↔ Switch: 擴展 LAN
        if (fromTypeStr === 'switch' && toTypeStr === 'switch') {
          return {
            concept: 'LAN 擴展',
            description: '你擴展了 LAN！連接多個 Switch 可以擴大區域網路的範圍，讓更多設備加入同一個區域網路。'
          };
        }
        
        // Host ↔ Host: 點對點連線
        if (fromTypeStr === 'host' && toTypeStr === 'host') {
          return {
            concept: '點對點連線',
            description: '你建立了點對點連線！兩個 Host 直接連接，可以互相通訊。'
          };
        }
        
        // Router ↔ Router: 路由器間連線
        if (fromTypeStr === 'router' && toTypeStr === 'router') {
          return {
            concept: '路由器間連線',
            description: '你建立了路由器間連線！連接多個 Router 可以建立更複雜的網路拓撲，實現不同網路之間的互連。'
          };
        }
        
        // 預設情況
        return {
          concept: '網路連線',
          description: '你成功建立了網路連線！'
        };
      };
      
      const networkInfo = getNetworkConcept(fromType, toType, fromBuildingType, toBuildingType);
      const connectionMessage = `成功建立連線：${fromTypeName}${fromTypeLabel} → ${toTypeName}${toTypeLabel}`;
      const conceptMessage = `\n\n網路概念：${networkInfo.concept}\n${networkInfo.description}`;
      
      this.showConnectionModal(
        'success',
        '連線成功！',
        connectionMessage + conceptMessage,
        false
      );
      
      // 播放連線成功音效（fix.mp3，2秒）
      try {
        await audioService.playConnectionSuccessSound();
      } catch (error) {
        console.warn('播放連線成功音效失敗:', error);
      }
    },

    async showConnectionError(reason) {
      this.showConnectionModal(
        'error',
        '連線失敗',
        reason,
        true // 顯示連線規則
      );
      
      // 播放連線失敗音效（wrong.mp3）
      try {
        await audioService.playWrongAnswerSound();
      } catch (error) {
        console.warn('播放連線失敗音效失敗:', error);
      }
    },

    // 刪除連線模式相關方法
    startDeleteConnectionMode(targetPosition) {
      this.isDeletingConnection = true;
      this.deleteConnectionTarget = targetPosition;
      this.connectionsToDelete = this.getBuildingConnections(targetPosition.x, targetPosition.y);
      console.log('開始刪除連線模式，目標建築位置:', targetPosition);
      console.log('該建築的連線數量:', this.connectionsToDelete.length);
    },

    cancelDeleteConnectionMode() {
      this.isDeletingConnection = false;
      this.deleteConnectionTarget = null;
      this.connectionsToDelete = [];
      if (this.showConnections) {
        this.showConnections = false;
        this.clearSelectedConnection();
      }
    },

    async deleteSingleConnection(connectionId) {
      try {
        // 從後端刪除連線
        await apiService.removeConnection(connectionId);
        // 從本地狀態刪除連線
        this.connections = this.connections.filter(conn => conn.id !== connectionId);
        if (this.selectedConnectionId === connectionId) {
          this.clearSelectedConnection();
        }
        // 更新連線列表
        if (this.deleteConnectionTarget) {
          this.connectionsToDelete = this.getBuildingConnections(
            this.deleteConnectionTarget.x, 
            this.deleteConnectionTarget.y
          );
        }
        console.log('連線已刪除:', connectionId);
        
        // 如果沒有連線了，退出刪除模式
        if (this.connectionsToDelete.length === 0) {
          this.cancelDeleteConnectionMode();
        }
      } catch (error) {
        console.error('刪除連線失敗:', error);
      }
    },

    resetStore() {
      // 清除所有狀態，確保登出或切換帳號時不會殘留舊資料
      this.map = [];
      this.selectedTile = null;
      this.selectedBuildingId = null;
      this.isPlacing = false;
      this.deleteTarget = null;
      this.placementMessage = null;
      this.tileDevelopedMessage = null;
      this.castleInteraction = null;
      this.isConnecting = false;
      this.connectionSource = null;
      this.connections = [];
      this.showConnections = false;
      this.isDeletingConnection = false;
      this.deleteConnectionTarget = null;
      this.connectionsToDelete = [];
      this.shopBuildings = [];
      // 清除連線顯示的 localStorage 設定（可選，但為了完全清除建議保留）
      // localStorage.removeItem('showConnections');
    }
  }
});

