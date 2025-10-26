import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService'; // 引入我們統一的 apiService
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
    
    // 連線模式相關狀態
    isConnecting: false,
    connectionSource: null, // 連線的起始建築物位置
    connections: [], // 已建立的連線列表（刷新後會重置，這是正常的）
    showConnections: localStorage.getItem('showConnections') !== null 
      ? localStorage.getItem('showConnections') === 'true' 
      : true, // 是否顯示連線
    
    // 商店建築列表：由後端載入
    shopBuildings: []
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
        this.cancelConnection();
        return;
      }

      // 檢查連線是否已存在
      const connectionExists = this.connections.some(conn => 
        (conn.from.x === this.connectionSource.x && conn.from.y === this.connectionSource.y && 
         conn.to.x === targetPosition.x && conn.to.y === targetPosition.y) ||
        (conn.from.x === targetPosition.x && conn.from.y === targetPosition.y && 
         conn.to.x === this.connectionSource.x && conn.to.y === this.connectionSource.y)
      );

      if (connectionExists) {
        console.log('連線已存在');
        this.cancelConnection();
        return;
      }

      try {
        // 添加新連線到後端
        const newConnection = {
          from: { ...this.connectionSource },
          to: { ...targetPosition }
        };

        const savedConnection = await apiService.addConnection(newConnection);
        console.log('連線已保存到後端:', savedConnection);

        // 添加到本地狀態
        this.connections.push(savedConnection);
        console.log('本地連線列表已更新');
        
      } catch (error) {
        console.error('保存連線失敗:', error);
        alert('保存連線失敗，請重試');
      }
      
      this.cancelConnection();
    },

    // 從後端載入連線
    async loadConnections() {
      try {
        const connections = await apiService.getConnections();
        this.connections = connections;
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

    // 切換連線顯示/隱藏
    toggleConnections() {
      this.showConnections = !this.showConnections;
      localStorage.setItem('showConnections', this.showConnections.toString());
      console.log('連線顯示狀態:', this.showConnections ? '顯示' : '隱藏');
    }
  }
});

