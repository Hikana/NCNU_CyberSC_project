<template>
  <div class="audio-test">
    <h2>音頻測試頁面</h2>
    
    <div class="test-section">
      <h3>文件檢查</h3>
      <p>BGM 文件路徑: {{ bgmPath }}</p>
      <p>文件是否存在: {{ fileExists ? '✅ 是' : '❌ 否' }}</p>
    </div>
    
    <div class="test-section">
      <h3>音頻測試</h3>
      <button @click="testAudio" class="test-btn">測試音頻載入</button>
      <p v-if="testResult">{{ testResult }}</p>
    </div>
    
    <div class="test-section">
      <h3>控制面板</h3>
      <AudioControls />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AudioControls from '@/components/AudioControls.vue'
import bgmFile from '@/assets/BGM.mp3'

const bgmPath = ref(bgmFile)
const fileExists = ref(false)
const testResult = ref('')

const testAudio = async () => {
  try {
    testResult.value = '正在測試音頻載入...'
    
    // 創建一個新的 Audio 對象來測試
    const testAudio = new Audio(bgmFile)
    
    testAudio.addEventListener('canplaythrough', () => {
      testResult.value = '✅ 音頻文件可以正常載入和播放'
      fileExists.value = true
    })
    
    testAudio.addEventListener('error', (e) => {
      testResult.value = `❌ 音頻載入失敗: ${e.message}`
      fileExists.value = false
    })
    
    // 嘗試載入音頻
    testAudio.load()
    
  } catch (error) {
    testResult.value = `❌ 測試失敗: ${error.message}`
    fileExists.value = false
  }
}

onMounted(() => {
  console.log('🎵 音頻測試頁面已載入')
  console.log('🎵 BGM 文件路徑:', bgmFile)
})
</script>

<style scoped>
.audio-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.test-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.test-btn {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.test-btn:hover {
  background: #45a049;
}

h2, h3 {
  color: #333;
}

p {
  margin: 10px 0;
  color: #666;
}
</style>
