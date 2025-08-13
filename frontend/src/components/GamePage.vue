<template>
  <div class="game-wrapper">
    <PixiGameCanvas @closeNpcMenu="showNpcMenu = false" />
    <div class="ui-layer">
      <StatusBar
        :techPoints="techPoints"
        :wallDefense="wallDefense"
        :showWallMenu="showWallMenu"
        :toggleWallMenu="toggleWallMenu"
      />
      <img :src="npcImage" alt="NPC" class="npc" @click="showNpcMenu = !showNpcMenu"/>
      
      <NpcMenu 
        :visible="showNpcMenu" 
        @close="handleCloseNpcMenu" 
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

// 🔥 新增：處理 NpcMenu 關閉事件
function handleCloseNpcMenu() {
  console.log('父組件：關閉 NPC 選單')
  showNpcMenu.value = false
}

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

.ui-layer {
  position: relative;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
}

.npc {
  position: absolute;
  bottom: 20px;
  left: 30px;
  width: 120px;
  height: auto;
  cursor: pointer;
}
</style>