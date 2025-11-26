<template>
  <div class="history-panel">
    <div class="filter-buttons">
      <button
        :class="{ active: filterType === 'correct' }"
        @click="filterType = 'correct'"
      >
        正確
      </button>
      <button
        :class="{ active: filterType === 'incorrect' }"
        @click="filterType = 'incorrect'"
      >
        錯誤
      </button>
    </div>

    <div v-if="historyStore.isLoading" class="loading">載入中...</div>
    <div v-else-if="historyStore.error" class="error">
      載入失敗: {{ historyStore.error }}
    </div>

    <div v-else>
      <div v-if="filteredHistory.length === 0" class="empty">
        目前沒有{{ filterType === 'correct' ? '答對' : '答錯' }}的紀錄。
      </div>

      <div v-else class="history-list">
        <div
          v-for="entry in filteredHistory"
          :key="entry.id"
          class="history-item"
          :class="{ correct: entry.isCorrect, incorrect: !entry.isCorrect }"
        >
          <p class="question">題目：{{ entry.questionTitle }}</p>
          <p class="answer">你的答案：{{ entry.yourAnswer || entry.userAnswer || '未知' }}</p>
          <p v-if="!entry.isCorrect" class="correct-answer">
            正確答案：{{ entry.correctAnswer }}
          </p>

          <button class="explain-button" @click="showExplanation(entry)">
            查看解釋
          </button>
        </div>
      </div>
    </div>

    <!-- 🔹 解釋彈出視窗 - 內嵌在 NPC Menu 中 -->
    <transition name="slide-up">
      <div v-if="selectedExplanation" class="explain-overlay">
        <div class="explain-content">
          <h3>📘 題目解釋</h3>
          <p class="question">{{ selectedExplanation.questionTitle }}</p>

          <div class="answer-section">
            <p><strong>你的答案：</strong> {{ selectedExplanation.yourAnswer }}</p>
            <p><strong>正確答案：</strong> {{ selectedExplanation.correctAnswer }}</p>
            <p class="explanation-text">{{ selectedExplanation.description }}</p>
          </div>

          <button class="close-explain-btn" @click="selectedExplanation = null">
            關閉
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHistoryStore } from '@/stores/historyStore';

const historyStore = useHistoryStore();
const selectedExplanation = ref(null);
const filterType = ref('correct'); 

onMounted(() => {
  if (historyStore.history.length === 0) {
    historyStore.fetchHistory();
  }
});

const filteredHistory = computed(() => {
  if (filterType.value === 'correct') {
    return historyStore.history.filter((h) => h.isCorrect);
  } else {
    return historyStore.history.filter((h) => !h.isCorrect);
  }
});

// 查看解釋
function showExplanation(entry) {
  selectedExplanation.value = {
    questionTitle: entry.questionTitle,
    yourAnswer: entry.yourAnswer || entry.userAnswer || '未知',
    correctAnswer: entry.correctAnswer || '無資料',
    description: entry.description || '暫無解釋',
  };
}
</script>

<style scoped>
.history-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 20px;
  position: relative; 
  min-height: 0; 
}

/* 篩選按鈕區 */
.filter-buttons {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 12px;
  margin-top: -18px; 
}

.filter-buttons button {
  font-size: 16px; 
  padding: 6px 18px;
  border: none;
  border-radius: 18px;
  background-color: #f1e0da;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
}

.filter-buttons button.active {
  background-color: #d7b19d;
  color: rgb(0, 0, 0);
  transform: scale(1.02); 
}

.filter-buttons button:hover {
  background-color: #e2c1b5;
}

/* 載入與錯誤訊息 */
.loading,
.error,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

/* 紀錄卡片樣式 */
.history-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 10px;
}

.history-item {
  background-color: rgba(47, 15, 25, 0.08);
  border-left: 5px solid;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 14px;
}

.history-item.correct {
  border-left-color: #2ecc71;
}

.history-item.incorrect {
  border-left-color: #e74c3c;
}

.question {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.answer,
.correct-answer {
  margin: 5px 0;
  color: #34495e;
}

/* 查看解釋按鈕 */
.explain-button {
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  border: 2px solid #ccc;
  border-radius: 12px;
  padding: 10px 22px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-top: 10px;
}

.explain-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 解釋彈出視窗 */
.explain-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 600;
  padding: 20px;
  pointer-events: none;
}

.explain-content {
  background: #fff;
  border-radius: 16px;
  padding: 28px 36px;
  width: 90vw;
  max-width: 550px;
  max-height: 60vh;
  overflow-y: auto;
  font-size: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  position: relative;
  pointer-events: auto;
}

.explain-content h3 {
  color: #333;
  font-size: 26px;
  margin-bottom: 20px;
  border-bottom: 3px solid #d7b19d;
  padding-bottom: 10px;
}

.explain-content .question {
  color: #2c3e50;
  font-size: 22px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.answer-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin: 16px 0;
}

.answer-section p {
  color: #2c3e50;
  margin: 12px 0;
  line-height: 1.6;
}

.answer-section strong {
  color: #d7b19d;
  font-size: 20px;
}

.explanation-text {
  background-color: #fff3e0;
  padding: 16px;
  border-left: 4px solid #ff9800;
  border-radius: 6px;
  margin-top: 16px;
  color: #333;
  font-size: 19px;
  line-height: 1.8;
}

.close-explain-btn {
  display: block;
  margin: 20px auto 0;
  background: #f06d6d;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.close-explain-btn:hover {
  background: #e85c5c;
  transform: scale(1.05);
}

/* ✅ 滑入動畫 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* ✅ 滾動條美化 */
.history-list::-webkit-scrollbar,
.explain-content::-webkit-scrollbar {
  width: 8px;
}

.history-list::-webkit-scrollbar-track,
.explain-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb,
.explain-content::-webkit-scrollbar-thumb {
  background: #d7b19d;
  border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb:hover,
.explain-content::-webkit-scrollbar-thumb:hover {
  background: #c4a088;
}
</style>