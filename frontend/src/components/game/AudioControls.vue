<template>
  <div class="audio-controls">
    <!-- 簡化的音樂控制按鈕 -->
    <div class="music-controls">
      <!-- 載入中 -->
      <div v-if="!audioStatus.isInitialized" class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>
      
      <!-- BGM 控制按鈕（sound） -->
      <button 
        v-if="audioStatus.isInitialized"
        @click="handleBgmClick"
        @keydown.enter.stop
        class="audio-btn bgm-btn"
        :class="{ 'muted': audioStatus.isBgmMuted }"
        :title="audioStatus.isBgmMuted ? '開啟 BGM' : '關閉 BGM'"
        type="button"
        tabindex="-1"
      >
        <img 
          :src="audioStatus.isBgmMuted ? soundOffImg : soundOnImg" 
          :alt="audioStatus.isBgmMuted ? 'BGM 已關閉' : 'BGM 已開啟'"
          class="audio-icon"
        />
      </button>
      
      <!-- 音效控制按鈕（music） -->
      <button 
        v-if="audioStatus.isInitialized"
        @click="handleSoundEffectsClick"
        @keydown.enter.stop
        class="audio-btn sound-effects-btn"
        :class="{ 'muted': audioStatus.isSoundEffectsMuted }"
        :title="audioStatus.isSoundEffectsMuted ? '開啟音效' : '關閉音效'"
        type="button"
        tabindex="-1"
      >
        <img 
          :src="audioStatus.isSoundEffectsMuted ? musicOffImg : musicOnImg" 
          :alt="audioStatus.isSoundEffectsMuted ? '音效已關閉' : '音效已開啟'"
          class="audio-icon"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { audioService } from '@/services/audioService'
import bgmFile from '@/assets/BGM.mp3'
import doorSoundFile from '@/assets/door.mp3'
import rightSoundFile from '@/assets/right.mp3'
import wrongSoundFile from '@/assets/wrong.mp3'
import successSoundFile from '@/assets/success.mp3'
import fixSoundFile from '@/assets/fix.mp3'
import soundOnImg from '@/assets/sound_on.png'
import soundOffImg from '@/assets/sound_off.png'
import musicOnImg from '@/assets/music_on.png'
import musicOffImg from '@/assets/music_off.png'

const audioStatus = ref({
  isPlaying: false,
  volume: 0.5,
  isMuted: false, // 舊版兼容
  isBgmMuted: false,
  isSoundEffectsMuted: false,
  isInitialized: false
})

// 更新音頻狀態
const updateStatus = () => {
  audioStatus.value = audioService.getStatus()
}

// 切換 BGM 靜音（只允許滑鼠點擊，不允許鍵盤觸發）
const handleBgmClick = (event) => {
  // 如果是鍵盤觸發的（Enter 或 Space），則阻止
  if (event.detail === 0 || event.type === 'keydown') {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  toggleBgm()
}

const toggleBgm = () => {
  try {
    console.log('🎵 點擊 BGM 按鈕')
    audioService.toggleBgmMute()
    updateStatus()
  } catch (error) {
    console.error('BGM 切換失敗:', error)
  }
}

// 切換音效靜音（只允許滑鼠點擊，不允許鍵盤觸發）
const handleSoundEffectsClick = (event) => {
  // 如果是鍵盤觸發的（Enter 或 Space），則阻止
  if (event.detail === 0 || event.type === 'keydown') {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  toggleSoundEffects()
}

const toggleSoundEffects = () => {
  try {
    console.log('🎵 點擊音效按鈕')
    audioService.toggleSoundEffectsMute()
    updateStatus()
  } catch (error) {
    console.error('音效切換失敗:', error)
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
    
    // 載入答題音效
    console.log('✅ 載入答對音效...')
    await audioService.loadSoundEffect('right', rightSoundFile)
    
    console.log('❌ 載入答錯音效...')
    await audioService.loadSoundEffect('wrong', wrongSoundFile)
    
    // 載入成就音效
    console.log('🎉 載入成就音效...')
    await audioService.loadSoundEffect('success', successSoundFile)
    
    // 載入連線成功音效
    console.log('🔗 載入連線成功音效...')
    await audioService.loadSoundEffect('fix', fixSoundFile)
    
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
  bottom: 220px; /* NPC 在 bottom: 20px，貓的高度約 180-200px，左上角在貓的上方 */
  left: 10px; /* NPC 在 left: 30px，聲音控制放在貓的左側（左上角位置） */
  z-index: 10000;
  pointer-events: auto;
}

.music-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  gap: 8px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
}

.audio-btn {
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
  pointer-events: auto;
  z-index: 10001;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding: 0;
  overflow: hidden;
  flex-shrink: 0;
}


.audio-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}

.audio-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.audio-btn.muted {
  background: rgba(255, 255, 255, 1);
  opacity: 0.6;
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
  
  .audio-btn {
    width: 35px;
    height: 35px;
  }
  
  .audio-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
