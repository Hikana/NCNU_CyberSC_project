<template>
  <div v-if="isVisible" class="confirm-dialog-overlay" @click="handleCancel">
    <div class="confirm-dialog" @click.stop>
      <!-- 標題區域 -->
      <div class="dialog-header">
        <div class="dialog-icon">
          <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3 class="dialog-title">{{ title }}</h3>
      </div>

      <!-- 內容區域 -->
      <div class="dialog-content">
        <p class="dialog-message" v-html="formatMessage(message)"></p>
      </div>

      <!-- 按鈕區域 -->
      <div class="dialog-actions">
        <button class="dialog-btn cancel-btn" @click="handleCancel">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          取消
        </button>
        <button class="dialog-btn confirm-btn" @click="handleConfirm">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '確認'
    },
    message: {
      type: String,
      default: '確定要執行此操作嗎？'
    }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    },
    formatMessage(msg) {
      // 將換行符轉換為 <br>
      return msg ? msg.replace(/\n/g, '<br>') : '';
    }
  }
}
</script>

<style scoped>
/* 科幻風格確認對話框 */

/* 遮罩層 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 68, 68, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 68, 68, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 0, 0, 0.9) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

/* 主對話框 */
.confirm-dialog {
  background: 
    linear-gradient(135deg, 
      rgba(30, 0, 0, 0.95) 0%, 
      rgba(50, 0, 0, 0.9) 50%, 
      rgba(20, 0, 0, 0.95) 100%);
  border-radius: 16px;
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 
    0 0 30px rgba(255, 68, 68, 0.4),
    0 0 60px rgba(255, 68, 68, 0.15),
    inset 0 0 20px rgba(255, 68, 68, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 450px;
  width: 90%;
  overflow: hidden;
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

/* 科幻邊框效果 */
.confirm-dialog::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(45deg, 
    #ff4444, #ff6666, #ff8888, #ff6666, #ff4444);
  background-size: 200% 200%;
  animation: borderGlow 3s ease-in-out infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
}

/* 標題區域 */
.dialog-header {
  display: flex;
  align-items: center;
  padding: 20px 24px 16px;
  background: 
    linear-gradient(135deg, 
      rgba(200, 0, 0, 0.8) 0%, 
      rgba(255, 68, 68, 0.6) 50%, 
      rgba(255, 100, 100, 0.8) 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.dialog-header::before {
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

/* 圖示 */
.dialog-icon {
  margin-right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  background: rgba(255, 68, 68, 0.2);
  border-radius: 50%;
  border: 2px solid rgba(255, 68, 68, 0.4);
}

.dialog-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 8px currentColor);
}

.warning-icon {
  color: #ffcccc;
  animation: warningPulse 1.5s ease-in-out infinite;
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  position: relative;
  z-index: 1;
  text-shadow: 
    0 0 10px rgba(255, 68, 68, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

/* 內容區域 */
.dialog-content {
  padding: 24px;
  background: rgba(20, 0, 0, 0.3);
  position: relative;
}

.dialog-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    #ff6666, 
    transparent);
  animation: scanLine 3s ease-in-out infinite;
}

.dialog-message {
  font-size: 1rem;
  line-height: 1.8;
  color: #ffaaaa;
  margin: 0;
  text-align: center;
  text-shadow: 0 0 5px rgba(255, 68, 68, 0.4);
  font-family: 'Courier New', monospace;
  white-space: pre-line;
}

.dialog-message :deep(br) {
  line-height: 1.8;
}

/* 按鈕區域 */
.dialog-actions {
  padding: 20px 24px 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  background: rgba(20, 0, 0, 0.2);
}

.dialog-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  min-width: 100px;
  justify-content: center;
}

.dialog-btn .btn-icon {
  width: 16px;
  height: 16px;
  stroke-width: 3;
}

/* 取消按鈕 */
.cancel-btn {
  background: 
    linear-gradient(135deg, 
      rgba(60, 60, 60, 0.8) 0%, 
      rgba(80, 80, 80, 0.6) 100%);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

.cancel-btn:hover {
  background: 
    linear-gradient(135deg, 
      rgba(80, 80, 80, 0.9) 0%, 
      rgba(100, 100, 100, 0.7) 100%);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 確認按鈕 */
.confirm-btn {
  background: 
    linear-gradient(135deg, 
      rgba(200, 0, 0, 0.8) 0%, 
      rgba(255, 68, 68, 0.6) 100%);
  color: #ffffff;
  border-color: rgba(255, 68, 68, 0.5);
  text-shadow: 0 0 5px rgba(255, 68, 68, 0.5);
}

.confirm-btn:hover {
  background: 
    linear-gradient(135deg, 
      rgba(220, 0, 0, 0.9) 0%, 
      rgba(255, 88, 88, 0.7) 100%);
  border-color: rgba(255, 68, 68, 0.7);
  box-shadow: 
    0 0 20px rgba(255, 68, 68, 0.5),
    0 0 40px rgba(255, 68, 68, 0.2);
  transform: translateY(-2px);
}

.dialog-btn:active {
  transform: translateY(0);
}

/* 動畫 */
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
    transform: translateY(-30px) scale(0.9);
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

@keyframes warningPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>
