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
    
    // 修改 confirmPlacement，使用 apiService
    async confirmPlacement() {
      if (!this.selectedTile || !this.selectedBuildingId) {
        console.warn('無法確認放置：未選擇瓦片或建築');
        return;
      }

      // 禁止在城堡九格放置
      const isCastleTile = (row, col) => (
        (row >= 1 && row <= 3) && (col >= 1 && col <= 3)
      )
      if (isCastleTile(this.selectedTile.y, this.selectedTile.x)) {
        alert('此區域為城堡，無法放置建築')
        this.isPlacing = false
        this.selectedTile = null
        this.selectedBuildingId = null
        return
      }

      try {
        const response = await apiService.placeBuilding(
          this.selectedBuildingId,
          this.selectedTile
        );
        
        if (response.success) {
          // 後端成功後才扣科技點
          const playerStore = usePlayerStore()
          const buildingItem = this.shopBuildings.find(b => b.id === this.selectedBuildingId)
          if (buildingItem) {
            playerStore.spendTechPoints(buildingItem.techCost)
            console.log(`確認建造，扣除 ${buildingItem.techCost} 科技點`)
          }
          // 後端回傳最新地圖狀態於 data
          this.map = response.data
          this.isPlacing = false
          this.selectedTile = null
          this.selectedBuildingId = null
          console.log('建築放置成功，更新地圖');
        } else {
          // 如果後端失敗，在本地更新地圖（用於測試）
          const { x, y } = this.selectedTile
          // 本地測試時也扣科技點
          const playerStore = usePlayerStore()
          const buildingItem = this.shopBuildings.find(b => b.id === this.selectedBuildingId)
          if (buildingItem) {
            playerStore.spendTechPoints(buildingItem.techCost)
            console.log(`確認建造（本地），扣除 ${buildingItem.techCost} 科技點`)
          }
          this.map[y][x] = {
            status: 'placed',
            item: this.selectedBuildingId
          }
          this.isPlacing = false
          this.selectedTile = null
          this.selectedBuildingId = null
          console.log('建築放置成功（本地更新），更新地圖');
          
          // 檢查建築相關成就
          try {
            const { useAchievementStore } = await import('./achievement')
            const achievementStore = useAchievementStore()
            achievementStore.checkBuildingAchievements()
          } catch (error) {
            console.log('成就檢查失敗:', error)
          }
        }
      } catch (err) {
        console.error('建築放置請求失敗:', err);
        alert('建築放置失敗，請重試');
      }
    },
    
    // 購買建築（不扣科技點，只進入放置模式）
    buyBuilding(buildingItem) {
      console.log(`選擇建築 ${buildingItem.name}！`)
      // 直接設置放置模式，不扣科技點
      this.setPlacementMode(true, buildingItem.id)
      return true
    },

    // 清除地圖上的所有建築（重置為空狀態）
    async clearAllBuildings() {
      try {
        // 先清除後端數據
        const res = await axios.delete('http://localhost:3000/api/buildings/clear')
        
        if (res.data.success) {
          // 後端清除成功，更新本地狀態
          this.map = res.data.map
          this.isPlacing = false
          this.selectedTile = null
          this.selectedBuildingId = null
          console.log('已清除地圖上的所有建築（後端同步）')
          return true
        } else {
          throw new Error('後端清除失敗')
        }
      } catch (error) {
        console.error('清除建築失敗:', error)
        // 如果後端失敗，至少清除本地狀態
        this.map = Array.from({ length: 20 }, () =>
          Array.from({ length: 20 }, () => ({ type: 'empty' }))
        )
        this.isPlacing = false
        this.selectedTile = null
        this.selectedBuildingId = null
        console.log('已清除地圖上的所有建築（僅本地）')
        return false
      }
    },

    // 清除特定位置的建築
    async clearBuildingAt(x, y) {
      try {
        const response = await apiService.clearBuilding({ x, y });
        if (response.success) {
          // 後端回傳可能是物件或二維陣列，統一轉成 20x20 陣列
          const newMap = response.data;
          if (Array.isArray(newMap)) {
            this.map = newMap;
          } else {
            const size = 20;
            this.map = Array.from({ length: size }, (_, row) =>
              Array.from({ length: size }, (_, col) => newMap[row]?.[col] || { status: 'locked' })
            );
          }
          console.log(`已清除位置 (${x}, ${y}) 的建築（後端同步）`)
        }
      } catch (e) {
        console.error('清除建築失敗:', e);
      }
    }
  }
});

