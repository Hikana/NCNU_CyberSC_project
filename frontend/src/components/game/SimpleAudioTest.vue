<template>
  <div class="simple-audio-test">
    <h3>音頻測試</h3>
    <button @click="testClick" class="test-button">測試點擊</button>
    <button @click="testAudio" class="test-button">測試音頻</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import bgmFile from '@/assets/BGM.mp3'

const message = ref('')

const testClick = () => {
  console.log('✅ 點擊測試成功！')
  message.value = '點擊測試成功！'
  setTimeout(() => {
    message.value = ''
  }, 2000)
}

const testAudio = async () => {
  try {
    console.log('🎵 開始音頻測試...')
    message.value = '正在測試音頻...'
    
    const audio = new Audio(bgmFile)
    audio.volume = 0.5
    
    audio.addEventListener('canplaythrough', () => {
      console.log('✅ 音頻可以播放')
      message.value = '音頻載入成功！'
    })
    
    audio.addEventListener('error', (e) => {
      console.error('❌ 音頻錯誤:', e)
      message.value = `音頻錯誤: ${e.message}`
    })
    
    await audio.play()
    console.log('✅ 音頻開始播放')
    message.value = '音頻播放成功！'
    
    setTimeout(() => {
      audio.pause()
      message.value = '音頻測試完成'
    }, 3000)
    
  } catch (error) {
    console.error('❌ 音頻測試失敗:', error)
    message.value = `音頻測試失敗: ${error.message}`
  }
}
</script>

<style scoped>
.simple-audio-test {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 99999;
  text-align: center;
}

.test-button {
  display: block;
  width: 200px;
  padding: 10px;
  margin: 10px auto;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.test-button:hover {
  background: #45a049;
}

h3 {
  margin: 0 0 15px 0;
}

p {
  margin: 10px 0;
  color: #ffeb3b;
}
</style>
