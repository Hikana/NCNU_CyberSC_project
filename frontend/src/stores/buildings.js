import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService'; // 引入我們統一的 apiService

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
    
    // 商店建築列表的 id 改為字串，以匹配 IsoGrid.js
    shopBuildings: [
      { id: 1, name: '建築A', img: buildingAImg, techCost: 50 },
      { id: 2, name: '建築B', img: buildingBImg, techCost: 60 },
      { id: 3, name: '建築C', img: buildingCImg, techCost: 70 },
      { id: 5, name: '建築E', img: buildingEImg, techCost: 90 },
      { id: 6, name: '建築F', img: buildingFImg, techCost: 90 },
      { id: 7, name: '建築G', img: buildingGImg, techCost: 90 },
      { id: 11, name: '建築K', img: buildingKImg, techCost: 120 },
      { id: 12, name: '建築L', img: buildingLImg, techCost: 120 },
      { id: 13, name: '建築M', img: buildingMImg, techCost: 140 },
      { id: 14, name: '建築N', img: buildingNImg, techCost: 150 },
      { id: 15, name: '建築O', img: buildingOImg, techCost: 160 },
      { id: 16, name: '建築P', img: buildingPImg, techCost: 180 },
      { id: 17, name: '建築Q', img: buildingQImg, techCost: 200 },
      { id: 18, name: '建築R', img: buildingRImg, techCost: 220 },
      { id: 19, name: '建築S', img: buildingSImg, techCost: 230 }
    ]
  }),
  actions: {
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
    
      // 禁止在城堡九格放置
      const isCastleTile = (row, col) => (row >= 1 && row <= 3) && (col >= 1 && col <= 3);
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
        
        console.log(`已清除位置 (${x}, ${y}) 的建築（後端同步）`);
        this.deleteTarget = null;
      } catch (e) {
        console.error('清除建築失敗:', e);
      }
    }
  }
});

