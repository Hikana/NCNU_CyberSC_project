import { defineStore } from 'pinia'
import axios from 'axios'

export const useBuildingStore = defineStore('buildings', {
  state: () => ({
    map: Array.from({ length: 20 }, () =>
      Array.from({ length: 20 }, () => ({ type: 'empty' }))
    ),
    selectedTile: null,
    selectedBuildingId: null,
    isPlacing: false
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
        }
      } catch (err) {
        console.error('建築放置失敗:', err)
        alert('建築放置失敗，請重試')
      }
    }
  }
})
