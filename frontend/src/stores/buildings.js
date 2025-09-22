import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService'; // ✅ 引入我們統一的 apiService

// 從 assets 引入圖片資源 (維持不變)
import buildingAImg from '@/assets/b1.png';
import buildingBImg from '@/assets/b2.png';
import buildingCImg from '@/assets/b3.png';
import buildingDImg from '@/assets/b4.png';
import buildingEImg from '@/assets/b5.png';
import buildingFImg from '@/assets/b6.png';
import buildingGImg from '@/assets/b7.png';
import buildingHImg from '@/assets/b8.png';
import buildingIImg from '@/assets/b9.png';

// ✅ 1. 修正 store 命名為複數
export const useBuildingStore = defineStore('buildings', {
  state: () => ({
    // ✅ 2. map 的初始狀態改為空物件，等待從後端載入
    map: {},
    selectedTile: null,
    selectedBuildingId: null,
    isPlacing: false,
    
    // ✅ 3. 商店建築列表的 id 改為字串，以匹配 IsoGrid.js
    shopBuildings: [
      { id: '1', name: '建築A', img: buildingAImg, techCost: 50 },
      { id: '2', name: '建築B', img: buildingBImg, techCost: 60 },
      { id: '3', name: '建築C', img: buildingCImg, techCost: 70 },
      { id: '4', name: '建築D', img: buildingDImg, techCost: 80 },
      { id: '5', name: '建築E', img: buildingEImg, techCost: 90 },
      { id: '6', name: '建築F', img: buildingFImg, techCost: 100 },
      { id: '7', name: '建築G', img: buildingGImg, techCost: 110 },
      { id: '8', name: '建築H', img: buildingHImg, techCost: 120 },
      { id: '9', name: '建築I', img: buildingIImg, techCost: 130 }
    ]
  }),
  actions: {
    // ✅ 2. 新增：從後端載入地圖狀態的 action
    async loadMap() {
  try {
    const response = await apiService.getMap();
    if (response.success) {
      const newMap = response.data;

      // 把物件轉成 20x20 陣列
      const size = 20;
      this.map = Array.from({ length: size }, (_, y) =>
        Array.from({ length: size }, (_, x) => newMap[y]?.[x] || { status: 'locked' })
      );

      console.log('✅ 地圖資料成功從後端載入並轉成陣列');
    }
  } catch (error) {
    console.error('從後端載入地圖失敗:', error);
  }
},



    // (setPlacementMode, startPlacing, selectTile, clearSelectedTile 維持不變)
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
    
    // ✅ 4. 修改 confirmPlacement，使用 apiService
    async confirmPlacement() {
      if (!this.selectedTile || !this.selectedBuildingId) {
        console.warn('無法確認放置：未選擇瓦片或建築');
        return;
      }
      try {
        const response = await apiService.placeBuilding(
          this.selectedBuildingId,
          this.selectedTile
        );
        
        if (response.success) {
          this.map = response.data; // 直接使用後端回傳的最新地圖
          this.setPlacementMode(false); // 成功後自動結束放置模式
          console.log('✅ 建築放置成功，地圖已更新');
        } else {
          alert('建築放置失敗：' + (response.message || '未知錯誤'));
        }
      } catch (err) {
        console.error('建築放置請求失敗:', err);
        alert('建築放置失敗，請重試');
      }
    },
    
    // (buyBuilding 維持不變，你的邏輯很棒)
    buyBuilding(buildingItem) {
      const playerStore = usePlayerStore();
      if (playerStore.spendTechPoints(buildingItem.techCost)) {
        console.log(`成功購買 ${buildingItem.name}！`);
        this.setPlacementMode(true, buildingItem.id);
        return true;
      } else {
        console.warn('科技點不足，無法購買！');
        return false;
      }
    }
  }
});

