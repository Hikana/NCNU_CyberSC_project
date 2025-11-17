<!-- src/components/RandomEventModal.vue -->
<template>
  <div v-if="eventStore.isModalOpen" class="event-modal" role="dialog" aria-modal="true">
    <div class="modal-backdrop"></div>
    <div class="modal-container">
      <div class="flip-container">
        <div class="event-card" :class="{ flipped: eventStore.flipped }">
          <!-- Front: 事件內容 + 倒數 + 防禦選項 -->
          <section class="card-face front" v-if="eventStore.currentEvent">
            <!-- 標題區域 -->
            <div class="card-header">
              <div class="event-icon">⚔️</div>
              <div class="title-section">
                <h2 class="event-title">{{ eventStore.currentEvent.name }}</h2>
                <p class="event-subtitle">{{ eventStore.currentEvent.shortExplain }}</p>
              </div>
            </div>

            <!-- 倒數計時器 -->
            <div class="timer-section">
              <div class="timer-display">
                <span class="timer-icon">⏰</span>
                <span class="timer-text">{{ eventStore.timeLeft }} 秒</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: percent + '%' }"></div>
              </div>
            </div>

            <!-- 事件描述 -->
            <div class="event-description">
              <p>{{ eventStore.currentEvent.gameDescription }}</p>
            </div>

            <!-- 防禦選項 -->
            <div class="defense-options">
              <h3 class="options-title">🛡️ 選擇防禦措施</h3>
              <div class="options-grid">
                <button
                  v-for="opt in eventStore.availableDefenses"
                  :key="opt.key"
                  class="defense-btn"
                  :class="{ 
                    'available': eventStore.status === 'pending',
                    'disabled': eventStore.status !== 'pending'
                  }"
                  :disabled="eventStore.status !== 'pending'"
                  @click="onDefenseClick(opt.key)"
                >
                  <div class="btn-content">
                    <span class="defense-name">{{ opt.name }}</span>
                    <span class="defense-description">{{ opt.description }}</span>
                    <span class="status-badge owned">
                      ✓ 已取得
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- 底部按鈕 -->
            <div class="card-footer">
              <button 
                class="skip-btn" 
                :disabled="eventStore.status !== 'pending'" 
                @click="eventStore.chooseDefense('skip')"
              >
                <span class="btn-icon">🚫</span>
                <span class="btn-text">不採取動作</span>
              </button>
            </div>
          </section>

          <!-- Back: 結果 + 失敗後果 + 現實案例 -->
          <section class="card-face back" v-if="eventStore.currentEvent">
            <!-- 結果標題 -->
            <div class="result-header">
              <div class="result-icon">
                <span v-if="eventStore.status === 'success'">🏆</span>
                <span v-else>💥</span>
              </div>
              <div class="result-title">
                <h2 v-if="eventStore.status === 'success'">防禦成功！</h2>
                <h2 v-else>防禦失敗</h2>
                <p v-if="eventStore.resultMessage" class="result-message">{{ eventStore.resultMessage }}</p>
              </div>
            </div>

            <!-- 失敗後果 -->
            <div v-if="eventStore.status === 'fail'" class="penalty-section">
              <div class="section-header">
                <span class="section-icon">⚠️</span>
                <h3>失敗後果</h3>
              </div>
              <div class="penalty-content">
                <p>{{ eventStore.currentEvent.failureConsequence }}</p>
                <div class="penalty-details">
                  <p class="penalty-text">{{ eventStore.currentEvent.penalty }}</p>
                </div>
              </div>
            </div>

            <!-- 現實案例 -->
            <div class="real-case-section">
              <div class="section-header">
                <span class="section-icon">📰</span>
                <h3>現實世界案例</h3>
              </div>
              <div class="case-content">
                <h4 class="case-title">{{ eventStore.currentEvent.realCase.title }}</h4>
                <p class="case-description">{{ eventStore.currentEvent.realCase.body }}</p>
              </div>
            </div>

            <!-- 關閉按鈕 -->
            <div class="card-footer">
              <button class="close-btn" @click="eventStore.closeModal()">
                <span class="btn-icon">✕</span>
                <span class="btn-text">關閉</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>

  <!-- 工具提示框 -->
  <ToolNotificationModal 
    :isVisible="toolNotification.visible"
    :type="toolNotification.type"
    :title="toolNotification.title"
    :message="toolNotification.message"
    @close="closeToolNotification"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEventStore } from '@/stores/eventStore'
import { useInventoryStore } from '@/stores/inventory'
import ToolNotificationModal from '@/components/game/ToolNotificationModal.vue'

// 狀態管理
const eventStore = useEventStore()
const inventoryStore = useInventoryStore()

// 工具提示框狀態
const toolNotification = ref({
  visible: false,
  type: 'info',
  title: '提示',
  message: ''
})

// 顯示提示框的輔助函數
function showToolNotification(type, title, message) {
  toolNotification.value = {
    visible: true,
    type,
    title,
    message
  }
}

// 關閉提示框的處理函數
function closeToolNotification() {
  toolNotification.value.visible = false
}

// 計算事件剩餘時間百分比
const percent = computed(() => {
  const ev = eventStore.currentEvent
  if (!ev) return 0
  const p = Math.round((eventStore.timeLeft / ev.timerSeconds) * 100)
  return Math.max(0, Math.min(100, p))
})

// 點擊防禦建材
async function onDefenseClick(key) {
  try {
    // 檢查背包裡有沒有這個道具
    const owned = inventoryStore.items.find(item => item.id === key)
    if (!owned || owned.qty <= 0) {
      console.warn(`沒有 ${key} 這個防禦工具`)
      return // 沒有就不能用
    }

    console.log(`🛡️ 嘗試使用防禦工具: ${key}`)
    
    // 先告訴事件系統「我選了這個防禦」
    eventStore.chooseDefense(key)
    
    // 無論成功或失敗，都扣除工具數量（因為已經使用了）
    await inventoryStore.useItem(key)
    
    if (eventStore.status === 'success') {
      console.log(`✅ 成功使用防禦工具 ${key}`)
    } else {
      console.log(`❌ 防禦工具 ${key} 無效，但已消耗`)
    }
    
  } catch (error) {
    console.error('❌ 使用防禦工具失敗:', error)
    // 顯示錯誤訊息給用戶
    showToolNotification(
      'error',
      '使用防禦工具失敗',
      `使用防禦工具失敗: ${error.message}`
    )
  }
}
</script>


<style scoped>
/* ===== 主要容器 ===== */
.event-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 40, 0.9));
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
}

/* ===== 翻轉卡片 ===== */
.flip-container {
  perspective: 1500px;
  width: 100%;
  height: 100%;
}

.event-card {
  position: relative;
  width: 100%;
  min-height: 600px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.event-card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border: 3px solid #4a5568;
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 32px;
  backface-visibility: hidden;
  overflow-y: auto;
  color: #e2e8f0;
  /* 自定義滾動條樣式 */
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

/* 卡片內容區域的滾動條樣式 */
.card-face::-webkit-scrollbar {
  width: 14px;
}

.card-face::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 7px;
  border: 2px solid #1a202c;
  margin: 8px 0;
}

.card-face::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a5568, #2d3748);
  border-radius: 7px;
  border: 2px solid #1a202c;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-face::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #718096, #4a5568);
  box-shadow: 0 0 8px rgba(74, 85, 104, 0.3);
}

.card-face::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #2d3748, #1a202c);
}

.card-face::-webkit-scrollbar-corner {
  background: #2d3748;
}

.card-face.back {
  transform: rotateY(180deg);
}

/* ===== 標題區域 ===== */
.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #4a5568;
}

.event-icon {
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.title-section {
  flex: 1;
}

.event-title {
  font-size: 28px;
  font-weight: 700;
  color: #f7fafc;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.event-subtitle {
  font-size: 16px;
  color: #a0aec0;
  margin: 0;
  line-height: 1.5;
}

/* ===== 倒數計時器 ===== */
.timer-section {
  margin-bottom: 24px;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.timer-icon {
  font-size: 24px;
}

.timer-text {
  font-size: 24px;
  font-weight: 700;
  color: #fbb6ce;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-bar {
  height: 12px;
  background: #2d3748;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f56565, #ed8936);
  border-radius: 6px;
  transition: width 0.3s linear;
  box-shadow: 0 0 10px rgba(245, 101, 101, 0.3);
}

/* ===== 事件描述 ===== */
.event-description {
  margin-bottom: 28px;
  padding: 20px;
  background: rgba(45, 55, 72, 0.3);
  border-radius: 16px;
  border-left: 4px solid #4299e1;
}

.event-description p {
  font-size: 16px;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0;
}

/* ===== 防禦選項 ===== */
.defense-options {
  margin-bottom: 28px;
}

.options-title {
  font-size: 20px;
  font-weight: 600;
  color: #f7fafc;
  margin: 0 0 16px 0;
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  /* 自定義滾動條樣式 */
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

/* Webkit 瀏覽器滾動條樣式 */
.options-grid::-webkit-scrollbar {
  width: 12px;
}

.options-grid::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 6px;
  border: 2px solid #1a202c;
}

.options-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a5568, #2d3748);
  border-radius: 6px;
  border: 2px solid #1a202c;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.options-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #718096, #4a5568);
  box-shadow: 0 0 8px rgba(74, 85, 104, 0.3);
}

.options-grid::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #2d3748, #1a202c);
}

.defense-btn {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 2px solid #4a5568;
  border-radius: 16px;
  background: linear-gradient(145deg, #2d3748, #1a202c);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.defense-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.defense-btn:hover::before {
  left: 100%;
}

.defense-btn.available {
  border-color: #48bb78;
  background: linear-gradient(145deg, #2f855a, #276749);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.defense-btn.available:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(72, 187, 120, 0.4);
}

.defense-btn.locked {
  opacity: 0.6;
  border-color: #e53e3e;
  background: linear-gradient(145deg, #742a2a, #5a2020);
  cursor: not-allowed;
}

.defense-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.defense-name {
  font-size: 16px;
  font-weight: 600;
  color: #f7fafc;
  text-align: center;
}

.defense-description {
  font-size: 12px;
  color: #a0aec0;
  text-align: center;
  line-height: 1.4;
  font-style: italic;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
}

.status-badge.owned {
  background: #48bb78;
  color: #f7fafc;
}

.status-badge.not-owned {
  background: #e53e3e;
  color: #f7fafc;
}

/* ===== 底部按鈕 ===== */
.card-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #4a5568;
}

.skip-btn, .close-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #4a5568;
  border-radius: 12px;
  background: linear-gradient(145deg, #2d3748, #1a202c);
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn:hover, .close-btn:hover {
  background: linear-gradient(145deg, #4a5568, #2d3748);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.skip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  font-size: 16px;
}

/* ===== 結果頁面 ===== */
.result-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #4a5568;
}

.result-icon {
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.result-title h2 {
  font-size: 28px;
  font-weight: 700;
  color: #f7fafc;
  margin: 0 0 8px 0;
}

.result-message {
  font-size: 16px;
  color: #a0aec0;
  margin: 0;
}

.penalty-section, .real-case-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(45, 55, 72, 0.3);
  border-radius: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #f7fafc;
  margin: 0;
}

.penalty-content p, .case-description {
  font-size: 15px;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0;
}

.penalty-details {
  margin-top: 12px;
  padding: 12px;
  background: rgba(245, 101, 101, 0.1);
  border-left: 4px solid #f56565;
  border-radius: 8px;
}

.penalty-text {
  font-size: 14px;
  font-weight: 600;
  color: #fbb6ce;
  margin: 0;
}

.case-title {
  font-size: 16px;
  font-weight: 600;
  color: #fbb6ce;
  margin: 0 0 8px 0;
}

/* ===== 動畫效果 ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===== 響應式設計 ===== */
@media (max-width: 768px) {
  .modal-container {
    max-width: 95vw;
    padding: 16px;
  }
  
  .card-face {
    padding: 24px;
    min-height: 500px;
  }
  
  .event-title {
    font-size: 24px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .defense-btn {
    padding: 14px;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .event-icon {
    font-size: 40px;
  }
}

@media (max-width: 480px) {
  .card-face {
    padding: 20px;
  }
  
  .event-title {
    font-size: 20px;
  }
  
  .timer-text {
    font-size: 20px;
  }
  
  .defense-name {
    font-size: 14px;
  }
}
</style>