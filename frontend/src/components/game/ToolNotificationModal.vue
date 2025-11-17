<template>
  <div v-if="isVisible" class="tool-notification-overlay" @click="closeModal">
    <div class="tool-notification-modal" @click.stop>
      <!-- 圖示區域 -->
      <div class="notification-icon">
        <svg v-if="type === 'error'" class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <svg v-else-if="type === 'success'" class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
        <svg v-else class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>

      <!-- 標題 -->
      <h3 class="notification-title">{{ title }}</h3>

      <!-- 訊息內容 -->
      <div class="notification-content">
        <p class="notification-message">{{ message }}</p>
      </div>

      <!-- 按鈕區域 -->
      <div class="notification-actions">
        <button class="notification-btn" @click.stop="closeModal" type="button">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'success', 'error', 'info'
    validator: value => ['success', 'error', 'info'].includes(value)
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

// 自動關閉計時器
let autoCloseTimer = null

// 監聽 isVisible，如果為 true 則在 3 秒後自動關閉（僅限成功訊息）
watch(() => props.isVisible, (newVal) => {
  // 清除之前的計時器
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  
  if (newVal && props.type === 'success') {
    autoCloseTimer = setTimeout(() => {
      closeModal()
      autoCloseTimer = null
    }, 3000)
  }
})

function closeModal() {
  // 清除自動關閉計時器
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  // 確保觸發關閉事件
  emit('close')
}

// 組件卸載時清除計時器
onUnmounted(() => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
})
</script>

<style scoped>
/* 遮罩層 - 科幻背景 */
.tool-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 20, 40, 0.8) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

/* 主視窗 - 科幻面板 */
.tool-notification-modal {
  background: 
    linear-gradient(135deg, 
      rgba(0, 30, 60, 0.95) 0%, 
      rgba(0, 50, 100, 0.9) 50%, 
      rgba(0, 20, 40, 0.95) 100%);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.3),
    0 0 60px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 450px;
  width: 90%;
  padding: 32px;
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  text-align: center;
}

/* 科幻邊框效果 */
.tool-notification-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(45deg, 
    #00ffff, #0080ff, #0040ff, #0080ff, #00ffff);
  background-size: 200% 200%;
  animation: borderGlow 3s ease-in-out infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  z-index: -1;
}

/* 圖示區域 */
.notification-icon {
  margin: 0 auto 20px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.notification-icon svg {
  width: 36px;
  height: 36px;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 8px currentColor);
}

.error-icon {
  color: #ff4444;
  animation: errorPulse 1s ease-in-out infinite;
}

.success-icon {
  color: #00ff88;
  animation: successGlow 1.5s ease-in-out infinite;
}

.info-icon {
  color: #00aaff;
  animation: infoFlicker 2s ease-in-out infinite;
}

/* 標題 */
.notification-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #f7fafc;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

/* 內容區域 */
.notification-content {
  margin-bottom: 24px;
}

.notification-message {
  font-size: 1rem;
  line-height: 1.6;
  color: #a0d0ff;
  margin: 0;
  text-align: center;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  font-family: 'Courier New', monospace;
  white-space: pre-line;
}

/* 按鈕區域 */
.notification-actions {
  display: flex;
  justify-content: center;
}

.notification-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: 
    linear-gradient(135deg, 
      rgba(0, 100, 200, 0.8) 0%, 
      rgba(0, 150, 255, 0.6) 100%);
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  pointer-events: auto;
  z-index: 1;
}

.notification-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  transition: left 0.5s ease;
}

.notification-btn:hover::before {
  left: 100%;
}

.notification-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: #00ffff;
}

.notification-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 4px currentColor);
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-40px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes borderGlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes errorPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px #ff4444);
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 16px #ff4444);
  }
}

@keyframes successGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px #00ff88);
  }
  50% {
    filter: drop-shadow(0 0 20px #00ff88);
  }
}

@keyframes infoFlicker {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 8px #00aaff);
  }
  50% {
    opacity: 0.7;
    filter: drop-shadow(0 0 12px #00aaff);
  }
}

/* 響應式設計 */
@media (max-width: 480px) {
  .tool-notification-modal {
    width: 95%;
    padding: 24px;
  }
  
  .notification-title {
    font-size: 1.2rem;
  }
  
  .notification-message {
    font-size: 0.9rem;
  }
  
  .notification-icon {
    width: 56px;
    height: 56px;
  }
  
  .notification-icon svg {
    width: 32px;
    height: 32px;
  }
}
</style>

