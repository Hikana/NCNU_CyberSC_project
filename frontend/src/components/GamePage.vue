<template>
  <div class="game-wrapper">
    <PixiGameCanvas />
    
    <div class="ui-layer">
      <StatusBar />
      <img :src="npcImage" alt="NPC" class="npc" @click="uiStore.toggleNpcMenu()" />
      <ControlsHint /> <NpcMenu />
      <WallMenu />
      <QuestionModal />
      
      </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import PixiGameCanvas from '@/components/PixiGameCanvas.vue';
import StatusBar from '@/components/StatusBar.vue';
import NpcMenu from '@/components/NpcMenu.vue';
import WallMenu from '@/components/WallMenu.vue';
import QuestionModal from '@/components/QuestionModal.vue';
import ControlsHint from '@/components/ControlsHint.vue'; // 引入新元件

import { usePlayerStore } from '@/stores/player';
import { useUiStore } from '@/stores/ui';

import npcImage from '@/assets/npc.png';

const playerStore = usePlayerStore();
const uiStore = useUiStore();

onMounted(() => {
  playerStore.startResourceGeneration();
});
</script>

<style scoped>
.game-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative; /* 成為所有絕對定位子元素的基準 */
  overflow: hidden;
  background-color: #1a252f; /* 給一個底色，防止閃爍 */
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
  width: 120px;
  height: auto;
  cursor: pointer;
  z-index: 11;
  transition: transform 0.2s ease-in-out;
}
.npc:hover {
    transform: scale(1.1);
}
</style>