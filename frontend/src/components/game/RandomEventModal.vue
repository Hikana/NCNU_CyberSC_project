<!-- src/components/RandomEventModal.vue -->
<template>
  <div v-if="eventStore.isModalOpen" class="event-modal" role="dialog" aria-modal="true">
    <div class="modal-backdrop"></div>
    <div class="modal-container">
      <div class="flip-container">
        <div class="event-card" :class="{ flipped: eventStore.flipped }">
          <!-- Front: 事件內容 + 倒數 + 防禦選項 -->
          <section class="card-face front" v-if="eventStore.currentEvent">
            
            <!-- 主要警報面板 -->
            <div class="alert-main-panel">
              <div class="panel-glow"></div>
              <div class="alert-banner-v3">
                <div class="alert-icon-large">
                  <div class="icon-glow"></div>
                  <div class="icon-box">
                    <span>⚠️</span>
                  </div>
                </div>
                <div class="alert-content-v3">
                  <p class="alert-category">資安事件警報</p>
                  <div class="alert-title-row">
                    <h1 class="alert-title-v3">{{ eventStore.currentEvent.name }}</h1>
                    <span class="timer-value compact">{{ eventStore.timeLeft }} 秒</span>
                    </div>
                    <div class="timer-bar-track compact">
                      <div class="timer-bar-fill" :style="{ width: percent + '%' }"></div>
                  </div>
                </div>
              </div>
              
              <div class="panel-body">
                <div class="description-card">
                  <p class="description-text">{{ eventStore.currentEvent.gameDescription }}</p>
                </div>
                
                <button class="info-expand-btn" @click="toggleInfo">
                  <div class="info-btn-content">
                    <span class="info-btn-icon">⚡</span>
                    <span class="info-btn-text">了解這種攻擊</span>
                  </div>
                  <span class="info-chevron" :class="{ open: isInfoExpanded }">⌄</span>
                </button>
                
                <transition name="accordion">
                  <div v-if="isInfoExpanded" class="info-expanded-content">
                    <p>{{ eventStore.currentEvent.shortExplain }}</p>
                  </div>
                </transition>
              </div>
            </div>

            <!-- 工具選擇面板 -->
            <div class="defense-section-v3">
              <div class="defense-glow"></div>
              <h3 class="defense-title-v3">部署防禦措施</h3>
              
              <div class="tool-grid-v3">
                <button
                  v-for="opt in eventStore.availableDefenses"
                  :key="opt.key"
                  class="tool-card-v3"
                  :class="{ disabled: eventStore.status !== 'pending' }"
                  :disabled="eventStore.status !== 'pending'"
                  @click="onDefenseClick(opt.key)"
                >
                  <div class="tool-icon-v3">{{ getToolIcon(opt.key) }}</div>
                  <div class="tool-info-v3">
                    <h4 class="tool-name-v3">{{ opt.name }}</h4>
                    <p class="tool-desc-v3">{{ opt.description }}</p>
                  </div>
                </button>
              </div>

              <div class="action-row-v3">
                <button
                  class="skip-btn-v3"
                  :disabled="eventStore.status !== 'pending'"
                  @click="eventStore.chooseDefense('skip')"
                >
                  不採取動作
                </button>
              </div>
            </div>
          </section>

          <!-- Back: 結果 + 失敗後果 + 現實案例 -->
          <section class="card-face back" v-if="eventStore.currentEvent">
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

  <ToolNotificationModal 
    :isVisible="toolNotification.visible"
    :type="toolNotification.type"
    :title="toolNotification.title"
    :message="toolNotification.message"
    @close="closeToolNotification"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useEventStore } from '@/stores/eventStore'
import { useInventoryStore } from '@/stores/inventory'
import ToolNotificationModal from '@/components/game/ToolNotificationModal.vue'

const eventStore = useEventStore()
const inventoryStore = useInventoryStore()

const TOOL_ICON_MAP = {
  mfa: '🔐',
  cdn: '🌐',
  'prepared_statements': '🧾',
  'output_encoding': '💬',
  'code_signing': '🧪',
  'port_blocking': '🚪',
  'ip_block': '🛑',
  backup: '💾'
}

const toolNotification = ref({
  visible: false,
  type: 'info',
  title: '提示',
  message: ''
})
const isInfoExpanded = ref(false)

function showToolNotification(type, title, message) {
  toolNotification.value = { visible: true, type, title, message }
}

function closeToolNotification() {
  toolNotification.value.visible = false
}

const percent = computed(() => {
  const ev = eventStore.currentEvent
  if (!ev) return 0
  const p = Math.round((eventStore.timeLeft / ev.timerSeconds) * 100)
  return Math.max(0, Math.min(100, p))
})

async function onDefenseClick(key) {
  try {
    const owned = inventoryStore.items.find(item => item.id === key)
    if (!owned || owned.qty <= 0) {
      console.warn(`沒有 ${key} 這個防禦工具`)
      return
    }
    
    eventStore.chooseDefense(key)
    await inventoryStore.useItem(key)
  } catch (error) {
    console.error('❌ 使用防禦工具失敗:', error)
    showToolNotification('error', '使用防禦工具失敗', `使用防禦工具失敗: ${error.message}`)
  }
}

function getToolIcon(key) {
  return TOOL_ICON_MAP[key] || '🛡️'
}

function toggleInfo() {
  isInfoExpanded.value = !isInfoExpanded.value
}

watch(
  () => eventStore.currentEvent,
  () => { isInfoExpanded.value = false }
)
</script>

<style scoped>
/* ===== 基礎設定 ===== */
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
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 1000px;
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
  background: linear-gradient(145deg, #0f172a, #1e293b);
  border-radius: 32px;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 24px;
  backface-visibility: hidden;
  overflow-y: auto;
  color: #e2e8f0;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.card-face::-webkit-scrollbar { width: 12px; }
.card-face::-webkit-scrollbar-track { background: #1e293b; border-radius: 6px; }
.card-face::-webkit-scrollbar-thumb { 
  background: linear-gradient(180deg, #475569, #334155);
  border-radius: 6px;
  border: 2px solid #1e293b;
}
.card-face::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #64748b, #475569); }

.card-face.back {
  transform: rotateY(180deg);
}

/* ===== 版面3：主要警報面板 ===== */
.alert-main-panel {
  position: relative;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(239, 68, 68, 0.25);
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.panel-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.15), transparent 70%);
  pointer-events: none;
}

.alert-banner-v3 {
  background: linear-gradient(135deg, #dc2626, #b91c1c, #991b1b);
  padding: 20px;
  display: flex;
  gap: 24px;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.alert-banner-v3::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.alert-icon-large {
  position: relative;
  flex-shrink: 0;
  transform: scale(0.9);
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.icon-box {
  position: relative;
  background: transparent;
  padding: 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content-v3 {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-category {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  letter-spacing: 0.1em;
  font-weight: 700;
  margin: 0;
}

.alert-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.alert-title-v3 {
  color: #ffffff;
  font-size: 40px;
  font-weight: 900;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.timer-value {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.timer-value.compact {
  font-size: 24px;
}

.timer-bar-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 999px;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #fef3c7, #fbbf24, #f59e0b);
  border-radius: inherit;
  transition: width 1s linear;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.timer-bar-track.compact {
  height: 6px;
}

.panel-body {
  padding: 20px 28px;
}

.description-card {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  margin-bottom: 20px;
}

.description-text {
  color: #e2e8f0;
  font-size: 17px;
  line-height: 1.7;
  margin: 0;
}

.info-expand-btn {
  width: 100%;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fbbf24;
}

.info-expand-btn:hover {
  background: linear-gradient(145deg, #334155, #1e293b);
  border-color: rgba(251, 191, 36, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.info-btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 16px;
}

.info-btn-icon {
  font-size: 20px;
}

.info-chevron {
  font-size: 20px;
  transition: transform 0.3s ease;
  font-weight: bold;
}

.info-chevron.open {
  transform: rotate(180deg);
}

.info-expanded-content {
  margin-top: 16px;
  padding: 16px 20px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  line-height: 1.7;
}

.accordion-enter-active, .accordion-leave-active {
  transition: all 0.3s ease;
}

.accordion-enter-from, .accordion-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== 版面3：工具選擇區 ===== */
.defense-section-v3 {
  position: relative;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.defense-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent);
  filter: blur(4px);
}

.defense-title-v3 {
  text-align: center;
  color: #f8fafc;
  font-size: 24px;
  font-weight: 900;
  margin: 0 0 32px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tool-grid-v3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.tool-card-v3 {
  background: linear-gradient(145deg, #334155, #1e293b);
  border: 2px solid rgba(71, 85, 105, 0.4);
  border-radius: 18px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-card-v3:hover:not(.disabled) {
  background: linear-gradient(145deg, #475569, #334155);
  border-color: rgba(59, 130, 246, 0.6);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.3);
}

.tool-card-v3.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-icon-v3 {
  font-size: 36px;
  text-align: center;
}

.tool-info-v3 {
  text-align: center;
}

.tool-name-v3 {
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.tool-desc-v3 {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.action-row-v3 {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.skip-btn-v3 {
  padding: 14px 32px;
  background: rgba(71, 85, 105, 0.2);
  border: 2px solid rgba(71, 85, 105, 0.4);
  border-radius: 999px;
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn-v3:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.3);
  border-color: rgba(148, 163, 184, 0.5);
  transform: translateY(-2px);
}

.skip-btn-v3:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 2px solid #4a5568;
}

.close-btn {
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

.close-btn:hover {
  background: linear-gradient(145deg, #4a5568, #2d3748);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-icon {
  font-size: 18px;
}

/* ===== 動畫 ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* ===== 響應式 ===== */
@media (max-width: 768px) {
  .modal-container {
    max-width: 95vw;
    padding: 12px;
  }
  
  .card-face {
    padding: 20px;
  }
  
  .alert-banner-v3 {
    flex-direction: column;
    padding: 24px;
    gap: 20px;
  }
  
  .alert-title-v3 {
    font-size: 28px;
  }
  
  .tool-grid-v3 {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .defense-title-v3 {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .alert-title-v3 {
    font-size: 24px;
  }
  
  .timer-value {
    font-size: 24px;
  }
  
  .tool-grid-v3 {
    grid-template-columns: 1fr;
  }
  
  .panel-body {
    padding: 24px;
  }
}
</style>