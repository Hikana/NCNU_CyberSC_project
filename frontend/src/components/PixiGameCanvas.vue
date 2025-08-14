<template>
  <div ref="pixiContainer" class="pixi-canvas"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { createPixiApp } from '../game/GameApp'
// import { createMap } from '../game/Map'
import { usePlayerStore } from '../stores/player'
//import { useGameStore } from '../stores/buildings'
import * as PIXI from 'pixi.js'

const pixiContainer = ref(null)
let cleanup = null
const playerStore = usePlayerStore()
const gameStore = useGameStore()
let playerSprite = null
let playerContainer = null
let grid = null

// 定義 emit 事件
const emit = defineEmits(['closeNpcMenu'])

//等角座標轉換
function toIsometric(x, y) {
  const TILE_SIZE = 64
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
  
  // 手動調用更新函數
  nextTick(() => {
    updatePlayerSprite();
  });
}

onMounted(async () => {
  await nextTick();
  window.addEventListener('keydown', handleKeydown)
  try {
    if (pixiContainer.value) {
      const result = await createPixiApp(pixiContainer.value, gameStore.map);
      cleanup = result.cleanup; // 正確賦值 cleanup
      playerContainer = result.playerContainer;
      grid = result.grid;
      
      // 在 grid 創建完成後設置瓦片點擊回調
      if (grid) {
        console.log('✅ Grid 創建成功，設置瓦片點擊回調');
        grid.onTileClick = (row, col) => {
          console.log('🎯 PixiGameCanvas 瓦片點擊回調被調用:', { row, col });
          if (gameStore.isPlacing) {
            console.log('✅ 在放置模式下，處理瓦片選擇');
            gameStore.selectTile({ x: col, y: row });
            console.log('✅ 選中瓦片完成:', { x: col, y: row });
            
            // 更新網格顯示以顯示選中的瓦片
            grid.setSelectedTile(col, row);
            
            // 顯示確認對話框
            showConfirmationDialog(col, row);
          } else {
            console.log('❌ 不在放置模式，忽略點擊');
          }
        };
        console.log('✅ 瓦片點擊回調設置完成');
      } else {
        console.error('❌ Grid 創建失敗');
      }
      
      // createMap(result.mapContainer);
      // 加入主角 sprite
      playerSprite = new PIXI.Graphics()
      playerSprite.circle(0, 0, 18).fill({ color: 0xffffff }) 
      playerContainer.addChild(playerSprite)
      updatePlayerSprite()
    }
  } catch (error) {
    console.error('Error initializing PixiJS app:', error);
  }
})

// 監聽地圖數據變化並更新網格
watch(() => gameStore.map, (newMap) => {
  if (grid) {
    grid.updateMapData(newMap);
  }
}, { deep: true });

onUnmounted(() => {
  if (cleanup) cleanup();
  window.removeEventListener('keydown', handleKeydown)
})

function updatePlayerSprite() {
  if (!playerSprite) return
  
  // 使用等角座標移動
  const isoPos = toIsometric(playerStore.x, playerStore.y)
  playerSprite.x = isoPos.x
  playerSprite.y = isoPos.y
  
  console.log('更新主角位置:', { 
    storeCoords: { x: playerStore.x, y: playerStore.y },
    spritePosition: { x: playerSprite.x, y: playerSprite.y },
    isoPos: isoPos
  });

  // 鏡頭跟隨主角
  if (playerContainer && playerContainer.parent && pixiContainer.value) {
    const worldContainer = playerContainer.parent
    const containerRect = pixiContainer.value.getBoundingClientRect()
    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 2 - 100 // 與初始化偏移一致
    worldContainer.x = centerX - isoPos.x
    worldContainer.y = centerY - isoPos.y
    
    console.log('更新世界容器位置:', { 
      worldX: worldContainer.x, 
      worldY: worldContainer.y,
      centerX: centerX, 
      centerY: centerY,
      isoPos: isoPos
    });
  }
}

watch([() => playerStore.x, () => playerStore.y], updatePlayerSprite) // 監聽主角座標變化

// 建築放置相關函數
function showConfirmationDialog(x, y) {
  console.log('顯示確認對話框:', { x, y });
  // 這裡可以顯示一個確認對話框
  if (confirm(`確認在位置 (${x}, ${y}) 新增建築？`)) {
    confirmPlacement();
  } else {
    // 取消選擇
    gameStore.selectTile(null);
    if (grid) {
      grid.clearSelectedTile();
    }
  }
}

function confirmPlacement() {
  console.log('確認建築放置');
  gameStore.confirmPlacement().then(() => {
    console.log('建築放置完成');
    // 清除選中的瓦片
    if (grid) {
      grid.clearSelectedTile();
    }
    // 關閉 NPC 選單
    emit('closeNpcMenu');
  }).catch((error) => {
    console.error('建築放置失敗:', error);
  });
}

function cancelPlacement() {
  console.log('取消建築放置');
  gameStore.setPlacementMode(false);
  // 清除選中的瓦片
  if (grid) {
    grid.clearSelectedTile();
  }
  // 關閉 NPC 選單
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
</style>