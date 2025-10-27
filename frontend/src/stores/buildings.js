import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService'; // 引入我們統一的 apiService
import { BUILDING_TYPES, createConnectionValidator, getConnectionColor } from '@/game/connectionRules'; // 引入連線規則模組
import routerImg from '@/assets/router.png';
import switchImg from '@/assets/switch.png';

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
    map: {},
    selectedTile: null,
    selectedBuildingId: null,
    isPlacing: false,
    deleteTarget: null,
    placementMessage: null,
    tileDevelopedMessage: null,
    castleInteraction: null,
    
    // 商店建築列表：由後端載入
    shopBuildings: [],
    
    // 連線功能相關狀態
    isConnecting: false, // 是否處於連線模式
    connectionStart: null, // 連線起始建築物 {x, y}
    connections: [], // 已建立的連線 [{from: {x, y}, to: {x, y}}]
    
    // 連線提示視窗狀態
    connectionModal: {
      isVisible: false,
      type: 'info', // 'success', 'error', 'info'
      title: '連線提示',
      message: '',
      showRules: false
    },
    
    // 建築物類型定義（使用模組化的定義）
    buildingTypes: BUILDING_TYPES
  }),
  actions: {
    async loadShop() {
      try {
        // 從後端 API 取得 shop 清單
        const items = await apiService.getBuildingShop();
        // 加入 type 與對應圖片：host 使用原本 B 系列圖，router/switch 使用相應 icon
        const typeToImg = (item) => {
          if (item.type === 'router') return routerImg;
          if (item.type === 'switch') return switchImg;
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
          console.log('🔐 認證錯誤，請重新登入');
          alert('認證失敗，請重新登入');
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
    
      const isCastleTile = (row, col) => (row >= 0 && row <= 2) && (col >= 0 && col <= 2);
      if (isCastleTile(this.selectedTile.y, this.selectedTile.x)) {
        alert('此區域為城堡，無法放置建築');
        this.isPlacing = false;
        this.selectedTile = null;
        this.selectedBuildingId = null;
        return;
      }
    
      try {
        // ✅ 確認前端呼叫方式
        const response = await apiService.placeBuilding(
          this.selectedBuildingId,
          { x: this.selectedTile.x, y: this.selectedTile.y } // 確保傳 position 是物件 {x,y}
        );
    
        if (response) {
          const playerStore = usePlayerStore();
          await playerStore.refreshPlayerData(); // 更新玩家資料
          this.map = response; // api 直接回傳 map 二維陣列
          this.isPlacing = false;
          this.selectedTile = null;
          this.selectedBuildingId = null;
          console.log('建築放置成功，更新地圖');
        } else {
          console.error('建築放置失敗:', response.message || '未知錯誤');
          alert('建築放置失敗，請稍後再試');
        }
      } catch (err) {
        console.error('建築放置請求失敗:', err);
        alert('建築放置失敗，請重試');
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
        const newMap = await apiService.clearBuilding({ x, y });
        
        // 確保是二維陣列格式
        if (Array.isArray(newMap) && Array.isArray(newMap[0])) {
          this.map = newMap;
        } else {
          console.error('清除建築後的地圖資料格式不正確:', newMap);
        }
        
        //建築物清除時的連線清理
        // 使用連線規則模組清除與該位置相關的所有連線
        const validator = createConnectionValidator(this.map, this.connections);
        this.connections = validator.clearConnectionsAt(x, y);
        
        // 如果正在選擇的連線起始點被清除，重置連線狀態
        if (this.connectionStart && this.connectionStart.x === x && this.connectionStart.y === y) {
          this.connectionStart = null;
        }
        
        console.log(`已清除位置 (${x}, ${y}) 的建築（後端同步）`);
        this.deleteTarget = null;
      } catch (e) {
        console.error('清除建築失敗:', e);
      }
    },
     //連線功能核心 Actions (第250-336行)
    // 連線功能相關 actions
    startConnectionMode() {
      this.isConnecting = true;
      this.isPlacing = false; // 關閉放置模式
      this.connectionStart = null;
      console.log('進入連線模式');
    },

    stopConnectionMode() {
      this.isConnecting = false;
      this.connectionStart = null;
      console.log('退出連線模式');
    },

    selectBuildingForConnection(x, y) {
      if (!this.isConnecting) return false;

      const cell = this.map?.[y]?.[x];
      if (!cell || cell.status !== 'placed' || !cell.buildingId) {
        console.log('該位置沒有建築物');
        return false;
      }

      if (!this.connectionStart) {
        // 選擇第一個建築物
        this.connectionStart = { x, y };
        const buildingType = this.getBuildingType(cell.buildingId);
        console.log(`選擇起始建築物: (${x}, ${y}) - ${buildingType?.name || '未知'}`);
        return true;
      } else {
        // 選擇第二個建築物，建立連線
        if (this.connectionStart.x === x && this.connectionStart.y === y) {
          console.log('不能連接到同一個建築物');
          this.connectionStart = null;
          return false;
        }

        // 使用連線規則模組檢查連線
        const validator = createConnectionValidator(this.map, this.connections);
        
        // 檢查是否已經存在相同的連線
        if (validator.isConnectionExists(this.connectionStart.x, this.connectionStart.y, x, y)) {
          console.log('連線已存在');
          this.connectionStart = null;
          return false;
        }

        // 驗證連線規則
        const validation = validator.canConnectBuildings(this.connectionStart.x, this.connectionStart.y, x, y);
        if (!validation.valid) {
          console.log('連線規則驗證失敗:', validation.reason);
          this.showConnectionError(validation.reason);
          this.connectionStart = null;
          return false;
        }

        // 建立新連線
        this.connections.push({
          from: { ...this.connectionStart },
          to: { x, y }
        });

        const fromType = this.getBuildingType(this.map[this.connectionStart.y][this.connectionStart.x].buildingId);
        const toType = this.getBuildingType(cell.buildingId);
        console.log(`✅ 建立連線: ${fromType?.name} -> ${toType?.name}`);
        
        // 顯示連線成功提示
        this.showConnectionSuccess(fromType, toType);
        
        this.connectionStart = null;
        return true;
      }
    },

    removeConnection(fromX, fromY, toX, toY) {
      const validator = createConnectionValidator(this.map, this.connections);
      this.connections = validator.removeConnection(fromX, fromY, toX, toY);
    },

    clearAllConnections() {
      this.connections = [];
      this.connectionStart = null;
    },

    // 保留 getBuildingType 方法供其他部分使用
    getBuildingType(buildingId) {
      return this.buildingTypes[buildingId] || null;
    },

    getBuildingConnections(x, y) {
      return this.connections.filter(conn => 
        (conn.from.x === x && conn.from.y === y) ||
        (conn.to.x === x && conn.to.y === y)
      );
    },
    // 使用連線規則模組取得網路狀態統計
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

    // 顯示連線成功提示
    showConnectionSuccess(fromType, toType) {
      this.showConnectionModal(
        'success',
        '連線成功！',
        `✅ 成功建立連線：${fromType?.name} → ${toType?.name}`,
        false
      );
    },

    // 顯示連線錯誤提示
    showConnectionError(reason) {
      this.showConnectionModal(
        'error',
        '連線失敗',
        reason,
        true // 顯示連線規則
      );
    }
  }
});

