<template>
  <!-- 載入故事畫面 -->
  <LoadingStory :visible="isLoading" :progress="loadingProgress" @ready="onStoryReady" />
  
  <div class="game-wrapper" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <PixiGameCanvas @game-ready="onGameReady" />
    
    <div class="ui-layer">
      <div style="position: absolute; top: 20px; left: 20px; z-index: 50; pointer-events: auto;">
        <router-link to="/home">
          <button style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            返回主頁
          </button>
        </router-link>
      </div>
      
      <!-- 音頻控制組件 -->
      <AudioControls />
      
      <StatusBar />
      <img :src="npcImage" alt="NPC" class="npc" @click="onNpcClick" />
      <ControlsHint :trigger="hintTrigger" /> 
      <NpcMenu @close="uiStore.closeAllMenus()" />
      <QuizPanel />
    </div>

    <!-- ✅ 新增：隨機事件彈窗 (只在遊戲裡出現) -->
    <RandomEventModal />
    
    <!-- Bingo 動畫組件 -->
    <BingoAnimation 
      :isVisible="gameStore.showBingoAnimation" 
      @close="gameStore.closeBingoAnimation()" 
    />

    <!-- 連線提示視窗 -->
    <ConnectionModal 
      v-if="buildingStore && buildingStore.connectionModal"
      :isVisible="buildingStore.connectionModal.isVisible"
      :type="buildingStore.connectionModal.type"
      :title="buildingStore.connectionModal.title"
      :message="buildingStore.connectionModal.message"
      :showRules="buildingStore.connectionModal.showRules"
      @close="buildingStore.hideConnectionModal"
    />

    <!-- 城堡升級提示 -->
    <div v-if="wallStore.castleUpgradeMessage" class="castle-upgrade-notification">
      <div class="upgrade-message">
        <div class="upgrade-text">{{ wallStore.castleUpgradeMessage }}</div>
      </div>
    </div>

    <!-- 城堡降級提示 -->
    <div v-if="wallStore.castleDowngradeMessage" class="castle-downgrade-notification">
      <div class="downgrade-message">
        <div class="downgrade-text">{{ wallStore.castleDowngradeMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import LoadingStory from '@/components/game/LoadingStory.vue';
import PixiGameCanvas from '@/components/game/PixiGameCanvas.vue';
import StatusBar from '@/components/game/StatusBar.vue';
import NpcMenu from '@/components/game/NpcMenu.vue';
import QuizPanel from '@/components/game/QuizPanel.vue';
import ControlsHint from '@/components/game/ControlsHint.vue';
import AudioControls from '@/components/game/AudioControls.vue';
import BingoAnimation from '@/components/game/BingoAnimation.vue';

import { usePlayerStore } from '@/stores/player';
import { useUiStore } from '@/stores/ui';
import { useInventoryStore } from '@/stores/inventory'; 
import { useAchievementStore } from '@/stores/achievement';
import { useWallStore } from '@/stores/wall';

import { useBuildingStore } from '@/stores/buildings';
import { useGameStore } from '@/stores/game'; 
import RandomEventModal from '@/components/game/RandomEventModal.vue'

import npcImage from '@/assets/NPC.gif';
import backgroundImage from '@/assets/background.png';

const playerStore = usePlayerStore();
const uiStore = useUiStore();
const inventoryStore = useInventoryStore();
const achievementStore = useAchievementStore();
const wallStore = useWallStore();
const buildingStore = useBuildingStore();
const gameStore = useGameStore();

// 載入狀態
const isLoading = ref(true);
const loadingProgress = ref(0);
const gameEngineReady = ref(false); // 遊戲引擎是否準備完成
const hintTrigger = ref(0); // 用於觸發八秒提示

// 遊戲準備完成回調
function onGameReady() {
  console.log('🎮 遊戲引擎準備完成');
  gameEngineReady.value = true;
  
  // 檢查認證狀態
  const isAuthenticated = checkAuthStatus();
  if (!isAuthenticated) {
    console.warn('⚠️ 用戶未登入，某些功能可能無法使用');
  }
  
  checkAllReady(); // 檢查是否所有資源都載入完成
}

// 檢查所有載入是否完成
function checkAllReady() {
  if (gameEngineReady.value && loadingProgress.value >= 80) {
    loadingProgress.value = 100;
  }
}

// 玩家確認已了解故事
function onStoryReady() {
  isLoading.value = false;
  // 使用者點「我已了解」進入遊戲後，觸發 8 秒提示
  hintTrigger.value++;
}

// 初始化玩家資料、成就系統和城堡系統
onMounted(async () => {
  loadingProgress.value = 20;
  // 1. 載入玩家基本資料
  await playerStore.loadPlayerData();
  
  loadingProgress.value = 40;
  // 2. 載入成就系統
  await achievementStore.loadAchievements();
  
  loadingProgress.value = 60;
  // 3. 載入城堡系統並同步等級
  await wallStore.loadCastleLevel();
  await wallStore.syncCastleLevel();
  
  loadingProgress.value = 80;
  console.log('📦 所有資料載入完成，等待遊戲引擎');
  // 檢查遊戲引擎是否已經準備好
  checkAllReady();
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

/* 城堡升級提示樣式 */
.castle-upgrade-notification {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
}

.upgrade-message {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: 3px solid #16a34a;
  border-radius: 16px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
  animation: slideInFromTop 0.5s ease-out;
}

.upgrade-text {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 城堡降級提示樣式 */
.castle-downgrade-notification {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
}

.downgrade-message {
  background: linear-gradient(135deg, #f87171, #ef4444);
  border: 3px solid #dc2626;
  border-radius: 16px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
  animation: slideInFromTop 0.5s ease-out;
}

.downgrade-text {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 動畫效果 */
@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
 
</style>