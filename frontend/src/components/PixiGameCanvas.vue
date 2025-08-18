<template>
  <div ref="pixiContainer" class="pixi-canvas"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useUiStore } from '@/stores/ui';
import { useGameStore } from '@/stores/game';
import { Game } from '@/game/Game.js';

const pixiContainer = ref(null);
const playerStore = usePlayerStore();
const uiStore = useUiStore();
const gameStore = useGameStore();
let gameInstance = null;

onMounted(() => {
  if (pixiContainer.value) {
    // 建立遊戲實例，並將所有需要的 stores 傳入
    gameInstance = new Game(pixiContainer.value, playerStore, uiStore, gameStore);
    gameInstance.init();
  }
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy();
  }
});
</script>

<style scoped>
.pixi-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0; /* 確保 z-index 為 0 或更低 */
}
</style>