<template>
  <div class="game-wrapper" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <PixiGameCanvas />
    
    <div class="ui-layer">
      <div style="position: absolute; top: 20px; left: 20px; z-index: 50; pointer-events: auto;">
        <router-link to="/home">
          <button style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            返回主頁
          </button>
        </router-link>
      </div>
      <StatusBar />
      <img :src="npcImage" alt="NPC" class="npc" @click="onNpcClick" />
      <ControlsHint /> 
      <NpcMenu @close="uiStore.closeAllMenus()" />
      <QuizPanel />
    </div>

    <!-- ✅ 新增：隨機事件彈窗 (只在遊戲裡出現) -->
    <RandomEventModal />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import PixiGameCanvas from '@/components/PixiGameCanvas.vue';
import StatusBar from '@/components/StatusBar.vue';
import NpcMenu from '@/components/NpcMenu.vue';
import QuizPanel from '@/components/QuizPanel.vue';
import ControlsHint from '@/components/ControlsHint.vue';

import { usePlayerStore } from '@/stores/player';
import { useUiStore } from '@/stores/ui';
import { useInventoryStore } from '@/stores/inventory'; 
import { useAchievementStore } from '@/stores/achievement';
import { useWallStore } from '@/stores/wall'; 
import RandomEventModal from './RandomEventModal.vue'
import npcImage from '@/assets/NPC.gif';
import backgroundImage from '@/assets/background.png';

const playerStore = usePlayerStore();
const uiStore = useUiStore();
const inventoryStore = useInventoryStore(); 
const achievementStore = useAchievementStore();
const wallStore = useWallStore(); 

// 初始化玩家資料、成就系統和城堡系統
onMounted(async () => {
  // 1. 載入玩家基本資料
  await playerStore.loadPlayerData();
  
  // 2. 載入成就系統
  await achievementStore.loadAchievements();
  
  // 3. 載入城堡系統並同步等級
  await wallStore.loadCastleLevel();
  await wallStore.syncCastleLevel();
});

// NPC 點擊事件：直接打開選單（背包資料從 Firebase 讀取）
function onNpcClick() {
  uiStore.toggleNpcMenu()
}

</script>

<style scoped>
.game-wrapper {
  position: fixed; /* 直接佔滿視窗，避免父層高度鏈問題 */
  inset: 0;        /* top:0; right:0; bottom:0; left:0; */
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* UI 圖層本身是透明的，並且會覆蓋整個畫面 */
.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  /* 關鍵：讓滑鼠點擊可以穿透此圖層，點到下面的 PixiJS canvas */
  pointer-events: none; 
}

/* UI 圖層內的具體元件，需要自己設定為可以被點擊 */
.npc, .controls-hint /* 以及所有選單和按鈕 */ {
  pointer-events: auto;
}

.npc {
  position: absolute;
  bottom: 20px;
  left: 30px;
  width: 180px;
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
  z-index: 30;
  pointer-events: auto;
}

/* 確保 NpcMenu 有正確的層級 */
:deep(.npc-menu) {
  z-index: 30;
  pointer-events: auto;
}

.npc:hover {
    transform: scale(1.1);
}
</style>