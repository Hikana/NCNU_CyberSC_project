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
import { createPixiApp } from '../game/GameApp'
import { usePlayerStore } from '../stores/player'
import { useBuildingStore } from '../stores/buildings'
import * as PIXI from 'pixi.js'
import playerImg from '../assets/player.png'

const pixiContainer = ref(null)
let cleanup = null
const playerStore = usePlayerStore()
const buildingStore = useBuildingStore()
let playerSprite = null
let playerContainer = null
let grid = null

const emit = defineEmits(['closeNpcMenu'])

function toIsometric(x, y) {
  const TILE_SIZE = 120
  const isoX = (x - y) * (TILE_SIZE / 2)
  const isoY = (x + y) * (TILE_SIZE / 4)
  return { x: isoX, y: isoY }
}

function handleKeydown(e) {

  if (e.key === 'ArrowUp') {
    playerStore.moveUp();
  }
  if (e.key === 'ArrowDown') {
    playerStore.moveDown();
  }
  if (e.key === 'ArrowLeft') {
    playerStore.moveLeft();
  }
  if (e.key === 'ArrowRight') {
    playerStore.moveRight();
  } 
  
  nextTick(() => {
    updatePlayerSprite();
  });
}


onMounted(async () => {
  await nextTick(); 
  window.addEventListener('keydown', handleKeydown) 
  try {
    if (pixiContainer.value) {
      const result = await createPixiApp(pixiContainer.value, buildingStore.map);
      cleanup = result.cleanup;
      playerContainer = result.playerContainer;
      grid = result.grid; 
      
      // 先處理網格設置
      if (grid) {
        
        grid.onTileClick = (row, col) => {
          if (buildingStore.isPlacing) {
            console.log('✅ 在放置模式下，處理瓦片選擇');
            buildingStore.selectTile({ x: col, y: row });
            grid.setSelectedTile(col, row);
          } else {
            console.log('❌ 不在放置模式，忽略點擊');
          }
        };
        
        grid.drawGrid();
        result.app.stage.eventMode = 'static';
      }
      
      // 創建玩家精靈 - 確保在網格之後添加到舞台
      try {
        
        // 等待圖片加載完成
        await PIXI.Assets.load(playerImg);
        
        playerSprite = PIXI.Sprite.from(playerImg);
        playerSprite.anchor.set(0.5, 0.5);
        playerSprite.width = 50;
        playerSprite.height = 50;
        
        // 確保玩家容器存在
        if (!playerContainer) {
          console.error('❌ playerContainer 不存在');
          return;
        }
        
        playerContainer.addChild(playerSprite);
        
        // 確保玩家容器在最頂層
        if (playerContainer.parent) {
          playerContainer.parent.removeChild(playerContainer);
          result.app.stage.addChild(playerContainer);
        }
        
        // 設置初始位置
        updatePlayerSprite();
        
      } catch (error) {
        console.error('❌ 創建玩家精靈失敗:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing PixiJS app:', error);
  }
})

function updatePlayerSprite() {
  
  const isoPos = toIsometric(playerStore.x, playerStore.y);
  playerSprite.x = isoPos.x;
  playerSprite.y = isoPos.y;
   
  // 確保精靈可見
  playerSprite.visible = true;
  playerSprite.alpha = 1;

  if (playerContainer && playerContainer.parent && pixiContainer.value) {
    const worldContainer = playerContainer.parent;
    const containerRect = pixiContainer.value.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2 - 100;
    worldContainer.x = centerX - isoPos.x;
    worldContainer.y = centerY - isoPos.y;
  }
}

watch(() => buildingStore.map, (newMap) => {
  if (grid) {
    grid.updateMapData(newMap);
  }
}, { deep: true });

onUnmounted(() => {
  if (cleanup) cleanup();
  window.removeEventListener('keydown', handleKeydown)
})


watch([() => playerStore.x, () => playerStore.y], updatePlayerSprite)

function confirmPlacement() {
  buildingStore.confirmPlacement().then(() => {
    if (grid) {
      // 清除選中狀態
      grid.clearSelectedTile();
      
      // 更新地圖數據到 IsoGrid
      grid.updateMapData(buildingStore.map);
      
      console.log('✅ 建築放置完成，地圖已更新');
    }
    emit('closeNpcMenu');
  }).catch((error) => {
    console.error('建築放置失敗:', error);
  });
}

function cancelPlacement() {
  buildingStore.setPlacementMode(false);
  if (grid) {
    grid.clearSelectedTile();
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
  z-index: 0; /* 保持較低的層級，讓其他 UI 元素可以覆蓋 */
  min-width: 100vw;
  min-height: 100vh;
  /* 確保可以接收點擊事件 */
  pointer-events: auto;
}

.pixi-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  /* 確保 canvas 元素可以接收事件 */
  pointer-events: auto !important;
  touch-action: auto;
}

/* 建築放置提示 UI 樣式 */
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