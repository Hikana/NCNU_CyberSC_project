<template>
  <div ref="pixiContainer" class="pixi-canvas"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { createPixiApp } from '../game/GameApp'
import { createMap } from '../game/Map'
import { usePlayerStore } from '../stores/player'
import * as PIXI from 'pixi.js'

const pixiContainer = ref(null)
let cleanup = null
const playerStore = usePlayerStore()
let playerSprite = null
let playerContainer = null

//等角座標轉換
function toIsometric(x, y) {
  const TILE_SIZE = 64
  const isoX = (x - y) * (TILE_SIZE / 2)
  const isoY = (x + y) * (TILE_SIZE / 4)
  return { x: isoX, y: isoY }
}

function handleKeydown(e) {
  if (e.key === 'ArrowUp') playerStore.moveUp()
  if (e.key === 'ArrowDown') playerStore.moveDown()
  if (e.key === 'ArrowLeft') playerStore.moveLeft()
  if (e.key === 'ArrowRight') playerStore.moveRight()
}

onMounted(async () => {
  await nextTick();
  window.addEventListener('keydown', handleKeydown)
  try {
    if (pixiContainer.value) {
      const result = await createPixiApp(pixiContainer.value);
      playerContainer = result.playerContainer;
      createMap(result.mapContainer);
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

onUnmounted(() => {
  if (cleanup) cleanup();
  window.removeEventListener('keydown', handleKeydown)
})

function updatePlayerSprite() {
  if (!playerSprite) return
  const iso = toIsometric(playerStore.x, playerStore.y)
  playerSprite.x = iso.x
  playerSprite.y = iso.y

  // 鏡頭跟隨主角
  if (playerContainer && playerContainer.parent && pixiContainer.value) {
    const worldContainer = playerContainer.parent
    const containerRect = pixiContainer.value.getBoundingClientRect()
    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 2 - 100 // 與初始化偏移一致
    worldContainer.x = centerX - iso.x
    worldContainer.y = centerY - iso.y
  }
}

watch([() => playerStore.x, () => playerStore.y], updatePlayerSprite) // 監聽主角座標變化
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