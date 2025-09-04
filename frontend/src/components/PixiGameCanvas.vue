<template>
  <div ref="pixiContainer" class="pixi-canvas"></div>
  
  <!-- 建築放置提示 -->
  <div v-if="buildingStore.isPlacing" class="placement-ui">
    <div class="placement-info">
      <p>選擇位置放置建築 (建築ID: {{ buildingStore.selectedBuildingId }})</p>
      <p v-if="buildingStore.selectedTile">
        已選中: ({{ buildingStore.selectedTile.x }}, {{ buildingStore.selectedTile.y }})
      </p>
      <p style="color: orange;">請點擊地圖上的瓦片來選擇位置</p>
    </div>
    
    <div class="placement-controls">
      <button 
        v-if="buildingStore.selectedTile" 
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
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useBuildingStore } from '@/stores/buildings'
import { useUiStore } from '@/stores/ui'
import { useGameStore } from '@/stores/game'
import { Game } from '@/game/Game.js'

const pixiContainer = ref(null)
const playerStore = usePlayerStore()
const buildingStore = useBuildingStore()
const uiStore = useUiStore()
const gameStore = useGameStore()
let gameInstance = null

const emit = defineEmits(['closeNpcMenu'])

// 監聽地圖變化，更新 IsoGrid
watch(() => buildingStore.map, (newMap) => {
  if (gameInstance && gameInstance.grid) {
    gameInstance.grid.updateMapData(newMap);
  }
}, { deep: true });

onMounted(async () => {
  if (pixiContainer.value) {
    // 建立遊戲實例，並將所有需要的 stores 傳入
    gameInstance = new Game(pixiContainer.value, playerStore, uiStore, gameStore);
    
    // 在初始化完成後，設置建築放置的點擊處理
    await gameInstance.init();
    
    // 設置建築放置的點擊處理
    if (gameInstance.grid) {
      gameInstance.grid.onTileClick = (row, col) => {
        if (buildingStore.isPlacing) {
          console.log('✅ 在放置模式下，處理瓦片選擇');
          buildingStore.selectTile({ x: col, y: row });
          gameInstance.grid.setSelectedTile(col, row);
        } else {
          console.log('❌ 不在放置模式，忽略點擊');
        }
      };
      
      // 重新繪製網格以啟用點擊事件
      gameInstance.grid.drawGrid();
    }
  }
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy();
  }
});

function confirmPlacement() {
  buildingStore.confirmPlacement().then(() => {
    if (gameInstance && gameInstance.grid) {
      // 清除選中狀態
      gameInstance.grid.clearSelectedTile();
      
      // 更新地圖數據到 IsoGrid
      gameInstance.grid.updateMapData(buildingStore.map);
      
      console.log('✅ 建築放置完成，地圖已更新');
    }
    emit('closeNpcMenu');
  }).catch((error) => {
    console.error('建築放置失敗:', error);
  });
}

function cancelPlacement() {
  buildingStore.setPlacementMode(false);
  if (gameInstance && gameInstance.grid) {
    gameInstance.grid.clearSelectedTile();
  }
  emit('closeNpcMenu');
}
</script>

<style scoped>
.pixi-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  min-width: 100vw;
  min-height: 100vh;
}

.pixi-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.placement-ui {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 150; /* 恢復原來的高層級 */
  min-width: 250px;
  pointer-events: auto;
}

.placement-info {
  margin-bottom: 10px;
}

.placement-info p {
  margin: 5px 0;
  color: #333;
  font-size: 14px;
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
  font-size: 14px;
  font-weight: bold;
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
  font-size: 14px;
  font-weight: bold;
}

.cancel-btn:hover {
  background: #da190b;
}
</style>