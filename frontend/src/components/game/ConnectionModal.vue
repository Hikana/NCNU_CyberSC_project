<template>
  <div v-if="isVisible" class="connection-modal-overlay" @click="closeModal">
    <div class="connection-modal" @click.stop>
      <!-- 標題區域 -->
      <div class="modal-header">
        <div class="modal-icon">
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
        <h3 class="modal-title">{{ title }}</h3>
      </div>

      <!-- 內容區域 -->
      <div class="modal-content">
        <p class="modal-message">{{ message }}</p>
        
        <!-- 連線規則說明（如果是連線錯誤） -->
        <div v-if="type === 'error' && showRules" class="connection-rules-info">
          <h4>連線規則提醒：</h4>
          <ul class="rules-list">
            <li><strong>貓屋 (Host):</strong> 只能連1個設備（一張網卡）</li>
            <li><strong>郵筒 (Switch):</strong> 最多連4個貓屋，可連郵筒和郵局</li>
            <li><strong>郵局 (Router):</strong> 可連任何設備，Host限制1個，其他不限</li>
          </ul>
        </div>
      </div>

      <!-- 按鈕區域 -->
      <div class="modal-actions">
        <button class="modal-btn primary" @click="closeModal">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConnectionModal',
  props: {
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
      default: '連線提示'
    },
    message: {
      type: String,
      default: ''
    },
    showRules: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
/* 科幻風格連線視窗 */

/* 遮罩層 - 科幻背景 */
.connection-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(0, 255, 255, 0.05) 0%, transparent 50%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 20, 40, 0.9) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.4s ease-out;
}

/* 主視窗 - 科幻面板 */
.connection-modal {
  background: 
    linear-gradient(135deg, 
      rgba(0, 30, 60, 0.95) 0%, 
      rgba(0, 50, 100, 0.9) 50%, 
      rgba(0, 20, 40, 0.95) 100%);
  border-radius: 16px;
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.3),
    0 0 60px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

/* 科幻邊框效果 */
.connection-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(45deg, 
    #00ffff, #0080ff, #0040ff, #0080ff, #00ffff);
  background-size: 200% 200%;
  animation: borderGlow 3s ease-in-out infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
}

/* 標題區域 - 科幻頭部 */
.modal-header {
  display: flex;
  align-items: center;
  padding: 24px 24px 16px;
  background: 
    linear-gradient(135deg, 
      rgba(0, 100, 200, 0.8) 0%, 
      rgba(0, 150, 255, 0.6) 50%, 
      rgba(0, 200, 255, 0.8) 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

/* 科幻背景動畫 */
.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
  animation: scanLine 2s ease-in-out infinite;
}

/* 圖示區域 */
.modal-icon {
  margin-right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.modal-icon svg {
  width: 24px;
  height: 24px;
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

.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  position: relative;
  z-index: 1;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

/* 內容區域 - 科幻內容 */
.modal-content {
  padding: 24px;
  background: rgba(0, 20, 40, 0.3);
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    #00ffff, 
    transparent);
  animation: scanLine 3s ease-in-out infinite;
}

.modal-message {
  font-size: 1rem;
  line-height: 1.6;
  color: #a0d0ff;
  margin: 0 0 20px 0;
  text-align: center;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  font-family: 'Courier New', monospace;
}

/* 連線規則說明 - 科幻面板 */
.connection-rules-info {
  background: 
    linear-gradient(135deg, 
      rgba(0, 40, 80, 0.8) 0%, 
      rgba(0, 60, 120, 0.6) 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  margin-top: 16px;
  position: relative;
  overflow: hidden;
}

.connection-rules-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 255, 0.05) 2px,
      rgba(0, 255, 255, 0.05) 4px
    );
  animation: gridMove 4s linear infinite;
}

.connection-rules-info h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #00ffff;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  font-family: 'Courier New', monospace;
}

.rules-list {
  margin: 0;
  padding-left: 20px;
  position: relative;
  z-index: 1;
}

.rules-list li {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #80c0ff;
  margin-bottom: 8px;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  font-family: 'Courier New', monospace;
}

.rules-list li:last-child {
  margin-bottom: 0;
}

.rules-list strong {
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.4);
}

/* 按鈕區域 - 科幻按鈕 */
.modal-actions {
  padding: 20px 24px 24px;
  display: flex;
  justify-content: center;
  background: rgba(0, 20, 40, 0.2);
}

.modal-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
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
}

.modal-btn::before {
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

.modal-btn:hover::before {
  left: 100%;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: #00ffff;
}

.modal-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 4px currentColor);
}

/* 科幻動畫效果 */
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
    transform: translateY(-60px) scale(0.8);
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

@keyframes scanLine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
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

@keyframes gridMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(20px);
  }
}

/* 響應式設計 */
@media (max-width: 480px) {
  .connection-modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 20px 20px 12px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-actions {
    padding: 16px 20px 20px;
  }
  
  .modal-title {
    font-size: 1.1rem;
  }
  
  .modal-message {
    font-size: 0.95rem;
  }
}

/* 深色模式優化 */
@media (prefers-color-scheme: dark) {
  .connection-modal {
    background: 
      linear-gradient(135deg, 
        rgba(0, 20, 40, 0.98) 0%, 
        rgba(0, 40, 80, 0.95) 50%, 
        rgba(0, 20, 40, 0.98) 100%);
  }
  
  .modal-message {
    color: #b0e0ff;
  }
  
  .connection-rules-info {
    background: 
      linear-gradient(135deg, 
        rgba(0, 30, 60, 0.9) 0%, 
        rgba(0, 50, 100, 0.7) 100%);
  }
  
  .rules-list li {
    color: #90d0ff;
  }
}
</style>
