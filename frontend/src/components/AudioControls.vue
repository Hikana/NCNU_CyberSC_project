<template>
  <div class="audio-controls">
    <!-- 簡化的音樂控制按鈕 -->
    <div class="music-controls">
      <!-- 載入中 -->
      <div v-if="!audioStatus.isInitialized" class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>
      
      <!-- 靜音按鈕 -->
      <button 
        v-if="audioStatus.isInitialized"
        @click="toggleMute" 
        class="mute-btn"
        :class="{ 'muted': audioStatus.isMuted }"
        :title="audioStatus.isMuted ? '取消靜音' : '靜音'"
      >
        {{ audioStatus.isMuted ? '🔇' : '🔊' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { audioService } from '@/services/audioService'
import bgmFile from '@/assets/BGM.mp3'
import doorSoundFile from '@/assets/door.mp3'

const audioStatus = ref({
  isPlaying: false,
  volume: 0.5,
  isMuted: false,
  isInitialized: false
})

// 更新音頻狀態
const updateStatus = () => {
  audioStatus.value = audioService.getStatus()
}

// 切換靜音
const toggleMute = () => {
  try {
    console.log('🎵 點擊靜音按鈕')
    audioService.toggleMute()
    updateStatus()
  } catch (error) {
    console.error('靜音切換失敗:', error)
  }
}

// 初始化音頻服務
const initAudio = async () => {
  try {
    console.log('🎵 開始初始化音頻服務...')
    await audioService.init(bgmFile)
    
    // 載入門音效
    console.log('🚪 載入門音效...')
    await audioService.loadSoundEffect('door', doorSoundFile)
    
    updateStatus()
    console.log('✅ 音頻服務初始化成功')
  } catch (error) {
    console.error('音頻初始化失敗:', error)
  }
}

onMounted(() => {
  console.log('🎵 AudioControls 組件已掛載')
  initAudio()
  
  // 定期更新狀態
  const statusInterval = setInterval(updateStatus, 1000)
  
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})
</script>

<style scoped>
.audio-controls {
  position: fixed;
  bottom: 150px;
  left: 160px;
  z-index: 10000;
  pointer-events: auto;
}

.music-controls {
  display: flex;
  align-items: center;
  background: transparent;
  padding: 0;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
}

.mute-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 1);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
  pointer-events: auto;
  z-index: 10001;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mute-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.mute-btn.muted {
  background: rgba(255, 255, 255, 1);
  color: #ff4444;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.5);
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 12px;
  background: rgba(255, 255, 255, 1);
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .audio-controls {
    bottom: 130px;
    left: 140px;
  }
  
  .music-controls {
    padding: 6px 8px;
  }
  
  .mute-btn {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
}
</style>
