import { defineStore } from 'pinia'
import axios from 'axios'
import { usePlayerStore } from './player'

// 從 assets 引入圖片資源
import buildingAImg from '@/assets/b1.png'
import buildingBImg from '@/assets/b2.png'
import buildingCImg from '@/assets/b3.png'
import buildingDImg from '@/assets/b4.png'
import buildingEImg from '@/assets/b5.png'
import buildingFImg from '@/assets/b6.png'
import buildingGImg from '@/assets/b7.png'
import buildingHImg from '@/assets/b8.png'
import buildingIImg from '@/assets/b9.png'

export const useBuildingStore = defineStore('buildings', {
  state: () => ({
    // 建築放置相關
    map: Array.from({ length: 20 }, () =>
      Array.from({ length: 20 }, () => ({ type: 'empty' }))
    ),
    selectedTile: null,
    selectedBuildingId: null,
    isPlacing: false,
    
    // 商店建築列表
    shopBuildings: [
      { id: 1, name: '建築A', img: buildingAImg, techCost: 50 },
      { id: 2, name: '建築B', img: buildingBImg, techCost: 60 },
      { id: 3, name: '建築C', img: buildingCImg, techCost: 70 },
      { id: 4, name: '建築D', img: buildingDImg, techCost: 80 },
      { id: 5, name: '建築E', img: buildingEImg, techCost: 90 },
      { id: 6, name: '建築F', img: buildingFImg, techCost: 100 },
      { id: 7, name: '建築G', img: buildingGImg, techCost: 110 },
      { id: 8, name: '建築H', img: buildingHImg, techCost: 120 },
      { id: 9, name: '建築I', img: buildingIImg, techCost: 130 }
    ]
  }),
  actions: {
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
    
    // 新增：清除選中的瓦片
    clearSelectedTile() {
      this.selectedTile = null;
    },
    async confirmPlacement() {
      if (!this.selectedTile || !this.selectedBuildingId) {
        console.log('無法確認放置:', { selectedTile: this.selectedTile, selectedBuildingId: this.selectedBuildingId });
        return;
      }

      try {
        console.log('發送建築放置請求:', {
          buildingId: this.selectedBuildingId,
          position: this.selectedTile
        });

        const res = await axios.post('http://localhost:3000/api/buildings', {
          buildingId: this.selectedBuildingId,
          position: { x: this.selectedTile.x, y: this.selectedTile.y }
        })
        
        if (res.data.success) {
          this.map = res.data.map
          this.isPlacing = false
          this.selectedTile = null
          this.selectedBuildingId = null
          console.log('建築放置成功，更新地圖');
        } else {
          // 如果後端失敗，在本地更新地圖（用於測試）
          const { x, y } = this.selectedTile
          this.map[y][x] = { 
            type: 'building', 
            buildingId: this.selectedBuildingId 
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
        console.error('建築放置失敗:', err)
        alert('建築放置失敗，請重試')
      }
    },
    
    // 購買建築
    buyBuilding(buildingItem) {
      const playerStore = usePlayerStore()
      if (playerStore.spendTechPoints(buildingItem.techCost)) {
        console.log(`成功購買 ${buildingItem.name}！`)
        // 購買成功後，設置放置模式
        this.setPlacementMode(true, buildingItem.id)
        return true
      } else {
        console.warn('科技點不足，無法購買！')
        return false
      }
    }
  }
})


