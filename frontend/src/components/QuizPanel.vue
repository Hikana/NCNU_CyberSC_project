<template>
  <div v-if="gameStore.isAnswering" class="quiz-panel">
    <div class="card-container" :class="{ flipped }">
      <!-- 正面：題目 -->
      <div class="card-face card-front">
        <button class="close-btn" @click="gameStore.closeQuestion()">×</button>
        <div class="quiz-header">
          <h3>探索挑戰</h3>
        </div>
        <div class="quiz-question">
          {{ gameStore.currentQuestion?.question || '載入中...' }}
        </div>
        <div class="quiz-options" v-if="hasOptions">
          <button
            v-for="(option, i) in gameStore.currentQuestion.options"
            :key="i"
            :class="['quiz-option', { selected: selectedAnswer === i }]"
            @click="selectOption(i)"
          >
            {{ String.fromCharCode(65 + i) }}. {{ option }}
          </button>
        </div>
        
        <div class="quiz-buttons" v-if="hasOptions">
          <button class="quiz-btn" :disabled="selectedAnswer === null" @click="submitChoice()">提交答案</button>
        </div>
      </div>

      <!-- 背面：結果 -->
      <div class="card-face card-back">
        <div class="result-panel">
          <div :class="['badge', result?.isCorrect ? 'ok' : 'ng']">
            {{ result?.isCorrect ? '✅ 答對了！' : '❌ 答錯了' }}
          </div>
          
          <!-- 答對時的獎勵信息 -->
          <div v-if="result?.isCorrect" class="reward-section">
            <div class="reward-title">🎁 獲得獎勵：</div>
            <div class="reward-items">
              <div class="reward-item positive">+15 科技點</div>
              <div class="reward-item positive">+10 防禦值</div>
              <div v-if="hasUnlockedTile" class="reward-item positive">土地已解鎖</div>
              <div v-if="result?.defenseTool?.success" class="reward-item positive">獲得防禦工具：{{ result.defenseTool.tool.name }}</div>
            </div>
          </div>
          
          <!-- 答錯時的懲罰信息 -->
          <div v-else class="penalty-section">
            <div class="penalty-title">⚠️ 答錯懲罰：</div>
            <div class="penalty-items">
              <div class="penalty-item">-5 科技點</div>
              <div class="penalty-item">-5 防禦值</div>
            </div>
            <div class="answer-text">正確答案：{{ result?.correctAnswer || '未知' }}</div>
          </div>
          
          <div class="explain">詳解：{{ result?.description }}</div>
          
          <div class="actions">
            <button class="quiz-btn" @click="finish()">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()
const selectedAnswer = ref(null)
const flipped = ref(false)
const result = ref(null)
const hasOptions = computed(() => {
  const q = gameStore.currentQuestion
  return q && Array.isArray(q.options) && q.options.length > 0
})

// 判斷是否有解鎖土地（當有 tileToUnlock 且答對時）
const hasUnlockedTile = computed(() => {
  return result.value?.isCorrect && gameStore.tileToUnlock
})

function selectOption(index) {
  selectedAnswer.value = index
}

function submitChoice() {
  if (selectedAnswer.value === null) return
  gameStore.submitAnswer(selectedAnswer.value).then(r => {
    result.value = r
    flipped.value = true
  }).catch(() => {}).finally(() => {
    selectedAnswer.value = null
  })
}

// 已移除文字作答流程，僅保留選擇題提交流程

function finish() {
  flipped.value = false
  result.value = null
  gameStore.closeQuestion()
}
</script>

<style scoped>
.quiz-panel {
  position: absolute;
  top: 32%; /* 整體上移 */
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  perspective: 1000px;
  max-width: 600px;
  min-width: 500px;
  z-index: 1000;
}

.card-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-container.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
}

.quiz-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 15px;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #bdc3c7;
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  color: #ffffff;
}

.quiz-question {
  font-size: 18px;
  margin-bottom: 20px;
  line-height: 1.5;
  text-align: left;
}

.quiz-options {
  margin: 20px 0;
}

.quiz-option {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  color: white;
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  width: 100%;
  font-size: 18px;
}

.quiz-option:hover {
  background: rgba(52, 152, 219, 0.3);
  border-color: #3498db;
}

.quiz-option.selected {
  background: rgba(52, 152, 219, 0.5);
  border-color: #3498db;
}

.quiz-option.correct {
  background: rgba(39, 174, 96, 0.5);
  border-color: #27ae60;
}

.quiz-option.wrong {
  background: rgba(231, 76, 60, 0.5);
  border-color: #e74c3c;
}

.quiz-buttons {
  text-align: center;
  margin-top: 20px;
}

.quiz-btn {
  background: #3498db;
  border: none;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  margin: 0 10px;
  font-size: 14px;
  transition: background 0.3s;
}

.quiz-btn:hover {
  background: #2980b9;
}

.quiz-btn:disabled {
  background: #7f8c8d;
  cursor: not-allowed;
}

.quiz-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.quiz-result.correct {
  background: rgba(39, 174, 96, 0.2);
  border: 1px solid #27ae60;
}

.quiz-result.wrong {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
}

.quiz-explanation {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
}

.result-panel {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
}

.badge {
  display: inline-block;
  padding: 8px 16px; 
  border-radius: 999px;
  font-weight: 700;
  font-size: 16px; 
  margin-top: -6px; 
  margin-bottom: 8px; 
}

.badge.ok {
  background: #d1fae5;
  color: #065f46;
}

.badge.ng {
  background: #fee2e2;
  color: #991b1b;
}

.reward-section {
  margin: 12px 0; 
}

.reward-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #fbbf24;
}

.reward-items {
  display: flex;
  flex-direction: column;
  gap: 6px; 
  margin-bottom: 12px; 
}

.reward-item {
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 500; 
  color: #22c55e;
}

.reward-item.positive {
  background: rgba(34, 197, 94, 0.1);
}

.penalty-section {
  margin: 12px 0; 
}

.penalty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #ef4444;
}

.penalty-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.penalty-item {
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 500;
  color: #ef4444;
}

.wrong-info {
  margin: 20px 0;
}

.explain {
  margin: 15px 0;
  font-size: 18px;
  line-height: 1.7;
  color: #e5e7eb; 
  font-weight: 600;
  text-align: left; 
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.answer-text {
  margin: 6px 0 0 0;
  font-size: 16px;
  color: #9ca3af;
  font-weight: 400;
  text-align: center;
}
</style>
 
