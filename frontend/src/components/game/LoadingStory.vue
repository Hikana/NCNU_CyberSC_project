<template>
  <transition name="fade">
    <div v-if="visible" class="loading-story" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <div class="story-container">
        <h1 class="story-title">🐾 故事背景</h1>
        
        <div class="story-content">
          <p class="story-text">
            小鎮的貓咪們想要建立一個「郵件系統」，讓大家可以彼此通信、寄信給遠方的朋友。
          </p>
          <p class="story-text">
            但一開始大家的通信效率很低、常常丟信或寄錯。
          </p>
          <p class="story-text">
            玩家的任務是幫助資安小鎮建立一個穩定又安全的郵件系統，
          </p>
          <p class="story-text">
            讓信件能順利通過每一個郵差、郵局與中繼站。
          </p>
        </div>

        <!-- 載入動畫 -->
        <div v-if="progress < 100" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p class="loading-text">遊戲載入中...</p>
        </div>

        <!-- 進度條 -->
        <div v-if="progress < 100" class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>

        <!-- 完成按鈕 -->
        <div v-else class="ready-section">
          <button @click="handleReady" class="ready-btn">
            我已了解
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import backgroundImage from '@/assets/background.png';

defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['ready'])

function handleReady() {
  emit('ready')
}
</script>

<style scoped>
.loading-story {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.story-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 50px 60px;
  max-width: 700px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideIn 0.8s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.story-title {
  font-size: 42px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.story-content {
  margin-bottom: 40px;
}

.story-text {
  font-size: 20px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 18px;
  color: #667eea;
  font-weight: 600;
  min-height: 27px;
  transition: all 0.3s ease;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 10px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 100% 0;
  }
}

.ready-section {
  margin-top: 20px;
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.ready-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.ready-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
}

.ready-btn:active {
  transform: translateY(-1px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

