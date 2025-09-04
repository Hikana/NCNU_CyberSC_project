<template>
  <div class="game-wrapper">
    <!-- PixiJS Canvas 在底層 -->
    <PixiGameCanvas @closeNpcMenu="showNpcMenu = false" />
    
    <!-- UI 元素分別定位，不使用覆蓋整個畫面的容器 -->
    <StatusBar 
      :techPoints="techPoints"
      :wallDefense="wallDefense"
      :showWallMenu="showWallMenu"
      :toggleWallMenu="toggleWallMenu"
    />
    
    <img 
      :src="npcImage" 
      alt="NPC" 
      class="npc" 
      @click="showNpcMenu = !showNpcMenu"
    />
    
    <NpcMenu 
      :visible="showNpcMenu"
      @close="showNpcMenu = false"
    />
    
    <WallMenu 
      :visible="showWallMenu"
      :techPoints="techPoints"
      :wallDefense="wallDefense"
      @update-tech="handleUpdateTech"
      @update-wall="handleUpdateWall"
    />
    
    <UIOverlay />
  </div>
</template>

<script setup>
import StatusBar from './StatusBar.vue'
import npcImage from '../assets/npc.png'
import { ref, onMounted, onUnmounted } from 'vue'
import NpcMenu from './NpcMenu.vue'
import WallMenu from './WallMenu.vue'
import PixiGameCanvas from '../components/PixiGameCanvas.vue'
import UIOverlay from '../components/UIOverlay.vue'

const showNpcMenu = ref(false)
const showWallMenu = ref(false)

// 集中管理點數
const techPoints = ref(100)
const wallDefense = ref(75)

// 每分鐘自動加一點科技點
let intervalId = null
onMounted(() => {
  intervalId = setInterval(() => {
    techPoints.value += 1
  }, 60000)
  window.addEventListener('npc-click', () => {
    showNpcMenu.value = true
  })
  window.addEventListener('wall-bar-click', () => {
    showWallMenu.value = true
  })
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

// WallMenu 消耗點數時回傳
function handleUpdateTech(val) {
  techPoints.value = val
}

function handleUpdateWall(val) {
  wallDefense.value = val
}

function toggleWallMenu() {
  showWallMenu.value = !showWallMenu.value
}
</script>

<style scoped>
.game-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 確保各個組件有正確的層級和事件處理 */
.npc {
  position: absolute;
  bottom: 20px;
  left: 30px;
  width: 120px;
  height: auto;
  cursor: pointer;
  z-index: 25; /* 確保在遊戲畫布之上 */
  pointer-events: auto;
}

/* 確保 StatusBar 有正確的層級 */
:deep(.status-bar) {
  z-index: 20;
  pointer-events: auto;
}

/* 確保 NpcMenu 有正確的層級 */
:deep(.npc-menu) {
  z-index: 30;
  pointer-events: auto;
}

/* 確保 WallMenu 有正確的層級 */
:deep(.wall-menu) {
  z-index: 25;
  pointer-events: auto;
}
</style>