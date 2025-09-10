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


    <!-- ✅ 新增：隨機事件彈窗 (只在遊戲裡出現) -->
    <RandomEventModal />

    <!--  [新增] 開始答題按鈕 -->
    <button class="quiz-btn" @click="openQuiz">
      開始答題
    </button>

    <!-- ✅[新增] 答題面板 -->
    <QuizPanel ref="quizPanelRef" />


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

import RandomEventModal from './RandomEventModal.vue'


/* ✅ [新增] 引入 QuizPanel */
import QuizPanel from './QuizPanel.vue' 

const showNpcMenu = ref(false)
const showWallMenu = ref(false)

// 集中管理點數
const techPoints = ref(100)
const wallDefense = ref(75)


/* ✅ [新增] 建立 ref，控制 QuizPanel */
const quizPanelRef = ref(null)            



  

  

/* ✅ [新增] 啟動答題方法 */
function openQuiz() {
  quizPanelRef.value.startQuiz("html")   // Firestore 的 category
}


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


/* ✅ [新增] 答題按鈕樣式 */
.quiz-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 40;       /* 確保在遊戲畫布之上 */
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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