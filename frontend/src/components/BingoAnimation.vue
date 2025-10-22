<template>
  <div v-if="isVisible" class="bingo-overlay">
    <div class="bingo-container">
      <img src="@/assets/bingo.gif" alt="Bingo!" class="bingo-gif" />
    </div>
    <div class="close-hint" @click="closeAnimation">
      <div class="close-text">點擊關閉</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const closeAnimation = () => {
  emit('close')
}
</script>

<style scoped>
.bingo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000; /* 降低 z-index，讓 UI 介面可以顯示在 gif 之上 */
  animation: fadeIn 0.3s ease-out;
  pointer-events: none; /* 讓點擊事件穿透到後面的 UI 組件 */
}

.bingo-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-hint {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 1001; /* 確保關閉提示在 gif 之上 */
  transition: background 0.3s ease;
  pointer-events: auto; /* 確保關閉提示可以接收點擊事件 */
  border: 2px solid rgba(255, 255, 255, 0.3);
  min-width: 120px;
  text-align: center;
}

.close-hint:hover {
  background: rgba(0, 0, 0, 0.9);
}

.close-text {
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.bingo-gif {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  border: none;
  outline: none;
  animation: playOnce 3s ease-out forwards; /* 播放一次，3秒後停止 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes playOnce {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

/* 響應式設計 - 全螢幕顯示 */
@media (max-width: 768px) {
  .bingo-gif {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }
}

@media (max-width: 480px) {
  .bingo-gif {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }
}
</style>
