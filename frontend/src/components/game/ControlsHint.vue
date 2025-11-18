<template>
  <div v-if="showNpcTip" class="dialog-bottom">
    <p class="dialog-message">是否進入遊戲操作教學？</p>
    <div class="dialog-actions">
      <button class="dialog-btn dialog-btn--primary" @click="startTutorial">是</button>
      <button class="dialog-btn" @click="dismissTutorial">否</button>
    </div>
  </div>
  <div class="controls-hint">
    <div><strong>控制說明:</strong></div>
    <div>↑↓←→ 移動角色</div>
    <div>Enter / E 檢視區域</div>
    <div>滑鼠拖動 移動視野</div>
  </div>

  <div v-if="tutorialVisible" class="tutorial-overlay">
    <div class="tutorial-modal">
      <img :src="currentTutorImage" alt="遊戲操作教學" class="tutorial-image" />
      <div class="tutorial-actions">
        <button 
          class="dialog-btn dialog-btn--secondary"
          :disabled="isFirstStep"
          @click="handlePrevStep"
        >
          上一步
        </button>
        <div class="tutorial-actions-right">
          <span class="step-indicator">{{ tutorialIndex + 1 }} / {{ tutorImages.length }}</span>
          <button class="dialog-btn dialog-btn--primary" @click="handleNextStep">
            {{ isLastStep ? '完成' : '下一步' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import tutor1 from '@/assets/tutor1.png'
import tutor2 from '@/assets/tutor2.png'
import tutor3 from '@/assets/tutor3.png'
import tutor4 from '@/assets/tutor4.png'
import tutor5 from '@/assets/tutor5.png'

const props = defineProps({
  trigger: {
    type: Number,
    default: 0
  }
})

const showNpcTip = ref(false)
const tutorialVisible = ref(false)
const tutorialIndex = ref(0)

const tutorImages = [
  tutor1,
  tutor2,
  tutor3,
  tutor4,
  tutor5
]

const currentTutorImage = computed(() => tutorImages[tutorialIndex.value])
const isLastStep = computed(() => tutorialIndex.value === tutorImages.length - 1)
const isFirstStep = computed(() => tutorialIndex.value === 0)

watch(
  () => props.trigger,
  () => {
    if (!props.trigger) return
    showNpcTip.value = true
  }
)

function startTutorial() {
  tutorialIndex.value = 0
  tutorialVisible.value = true
  showNpcTip.value = false
}

function dismissTutorial() {
  showNpcTip.value = false
}

function handleNextStep() {
  if (isLastStep.value) {
    tutorialVisible.value = false
    return
  }
  tutorialIndex.value += 1
}

function handlePrevStep() {
  if (tutorialIndex.value === 0) return
  tutorialIndex.value -= 1
}
</script>

<style scoped>
.controls-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 12; /* 確保在 UI 圖層之上 */
}

.dialog-bottom {
  position: absolute;
  bottom: 180px;
  left: 110px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: #fff;
  border-radius: 20px;
  padding: 16px 18px;
  font-size: 15px;
  line-height: 1.6;
  z-index: 13;
  background: rgba(0, 0, 0, 0.7);
  box-shadow: 0 15px 28px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}
.dialog-bottom::after {
  border-color: rgba(0, 0, 0, 0.7) transparent transparent;
  border-style: solid;
  border-width: 18px 12px 0 12px;
  bottom: -18px;
  content: "";
  height: 0;
  position: absolute;
  left: 50px;
  width: 0;
}
.npc-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}
.dialog-message {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}
.dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  pointer-events: auto;
}
.dialog-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  backdrop-filter: blur(6px);
}
.dialog-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
.dialog-btn--primary {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.25);
}
.dialog-btn--primary:hover {
  background: rgba(255, 255, 255, 0.4);
}
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  pointer-events: auto;
}

.tutorial-modal {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 18px;
  padding: 16px;
  max-width: 1024px;
  width: 96%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: auto;
}

.tutorial-image {
  width: 100%;
  height: clamp(460px, 62vh, 640px);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  object-fit: contain;
}

.tutorial-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;
}
.tutorial-actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tutorial-modal .dialog-btn {
  min-width: 100px;
  border: none;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.tutorial-modal .dialog-btn--secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.tutorial-modal .dialog-btn--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
}

.tutorial-modal .dialog-btn--primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.step-indicator {
  font-size: 14px;
  color: #4b5563;
}
</style>