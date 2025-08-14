<template>
    <div class="map-container">
      <div id="pixi-container"></div>
      
      <!-- 調試信息 -->
      <div class="debug-info">
        <h4>調試信息</h4>
        <p>放置模式: {{ gameStore.isPlacing ? '啟動' : '關閉' }}</p>
        <p>選中建築ID: {{ gameStore.selectedBuildingId || '無' }}</p>
        <p>選中瓦片: {{ gameStore.selectedTile ? `(${gameStore.selectedTile.x}, ${gameStore.selectedTile.y})` : '無' }}</p>
        <p>IsoGrid 狀態: {{ isoGridStatus }}</p>
      </div>
      
      <!-- 建築放置提示 -->
      <div v-if="gameStore.isPlacing" class="placement-ui">
        <div class="placement-info">
          <p>選擇位置放置建築 (建築ID: {{ gameStore.selectedBuildingId }})</p>
          <p v-if="gameStore.selectedTile">
            已選中: ({{ gameStore.selectedTile.x }}, {{ gameStore.selectedTile.y }})
          </p>
          <p style="color: orange;">請點擊地圖上的瓦片來選擇位置</p>
        </div>
        
        <div class="placement-controls">
          <button 
            v-if="gameStore.selectedTile" 
            @click="confirmPlacement"
            class="confirm-btn"
          >
            確認建造
          </button>
          <button @click="cancelPlacement" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, watch, ref } from 'vue'
  import { useGameStore } from '../stores/buildings'
  import { IsoGrid } from '../game/IsoGrid'
  import { Application } from 'pixi.js'
  
  const gameStore = useGameStore()
  const isoGridStatus = ref('未初始化')
  let isoGrid
  let app
  
  onMounted(async () => {
    console.log('=== MapView onMounted 開始 ===')
    
    try {
      isoGridStatus.value = '創建 PIXI 應用中...'
      
      app = new Application()
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      })
  
      document.getElementById('pixi-container').appendChild(app.view)
      console.log('PIXI 應用創建完成')
      
      isoGridStatus.value = '創建 IsoGrid 中...'
  
      // 創建網格，傳入瓦片點擊回調
      isoGrid = new IsoGrid(app, 20, 20, 64, (row, col) => {
        console.log('=== MapView 瓦片點擊回調觸發 ===')
        console.log('MapView 瓦片點擊:', { row, col })
        console.log('當前放置模式:', gameStore.isPlacing)
        console.log('當前選中建築ID:', gameStore.selectedBuildingId)
        
        // 只有在放置模式下才處理點擊
        if (gameStore.isPlacing) {
          console.log('✅ 在放置模式下，處理瓦片選擇')
          gameStore.selectTile({ x: col, y: row })
          console.log('✅ 選中瓦片完成:', { x: col, y: row })
          
          // 重新繪製網格以顯示選中狀態
          updateGridDisplay()
        } else {
          console.log('❌ 不在放置模式，忽略點擊')
        }
      })
  
      console.log('IsoGrid 創建完成:', isoGrid)
      isoGridStatus.value = '初始化網格中...'
      
      // 初始化網格
      isoGrid.updateMapData(gameStore.map)
      console.log('初始網格設置完成')
      
      isoGridStatus.value = '就緒'
      console.log('=== MapView 初始化完成 ===')
      
    } catch (error) {
      console.error('MapView 初始化錯誤:', error)
      isoGridStatus.value = '初始化失敗: ' + error.message
    }
  })
  
  // 監聽遊戲狀態變化
  watch(() => gameStore.map, (newMap) => {
    console.log('📍 地圖數據變化:', newMap)
    if (isoGrid) {
      isoGrid.updateMapData(newMap)
    }
  }, { deep: true })
  
  watch(() => gameStore.selectedTile, (newTile, oldTile) => {
    console.log('📍 選中瓦片變化:', { 舊: oldTile, 新: newTile })
    updateGridDisplay()
  })
  
  watch(() => gameStore.isPlacing, (isPlacing, wasPlacing) => {
    console.log('📍 放置模式變化:', { 之前: wasPlacing, 現在: isPlacing })
    if (isPlacing) {
      console.log('🔥 進入放置模式！請點擊地圖瓦片')
    } else {
      console.log('⭕ 退出放置模式')
    }
    updateGridDisplay()
  })
  
  watch(() => gameStore.selectedBuildingId, (newId, oldId) => {
    console.log('📍 選中建築ID變化:', { 之前: oldId, 現在: newId })
  })
  
  function updateGridDisplay() {
    if (isoGrid) {
      console.log('🎨 更新網格顯示')
      isoGrid.drawGrid()
    } else {
      console.warn('⚠️ isoGrid 不存在，無法更新顯示')
    }
  }
  
  function confirmPlacement() {
    console.log('=== 確認建築放置 ===')
    console.log('當前狀態:', {
      selectedTile: gameStore.selectedTile,
      selectedBuildingId: gameStore.selectedBuildingId,
      isPlacing: gameStore.isPlacing
    })
    
    gameStore.confirmPlacement().then(() => {
      console.log('✅ 建築放置完成')
      updateGridDisplay()
    }).catch((error) => {
      console.error('❌ 建築放置失敗:', error)
    })
  }
  
  function cancelPlacement() {
    console.log('❌ 取消建築放置')
    gameStore.setPlacementMode(false)
  }
  </script>
  
  <style scoped>
  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .debug-info {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 200;
    min-width: 200px;
  }
  
  .debug-info h4 {
    margin: 0 0 8px 0;
    color: #00ff00;
  }
  
  .debug-info p {
    margin: 3px 0;
  }
  
  .placement-ui {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(255, 255, 255, 0.95);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #4CAF50;
    z-index: 150;
  }
  
  .placement-info {
    margin-bottom: 10px;
  }
  
  .placement-info p {
    margin: 5px 0;
    color: #333;
  }
  
  .placement-controls {
    display: flex;
    gap: 10px;
  }
  
  .confirm-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .confirm-btn:hover {
    background: #45a049;
  }
  
  .cancel-btn {
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .cancel-btn:hover {
    background: #da190b;
  }
  </style>