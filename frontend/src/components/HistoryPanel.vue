<template>
  <div class="history-panel">
    <!-- ✅ 類別切換按鈕 -->
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

    <!-- 🔹 解釋彈出視窗 -->
    <div v-if="selectedExplanation" class="explain-modal">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHistoryStore } from '../stores/historyStore';

const historyStore = useHistoryStore();
const selectedExplanation = ref(null);
const filterType = ref('correct'); // ✅ 初始顯示正確紀錄

onMounted(() => {
  if (historyStore.history.length === 0) {
    historyStore.fetchHistory();
  }
});

// 根據選擇篩選資料
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
}

/* ✅ 篩選按鈕區 */
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

/* ✅ 紀錄卡片樣式 */
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
}

.answer,
.correct-answer {
  margin: 5px 0;
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
}

.explain-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 30, 30, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.explain-content {
  background: #fff;
  border-radius: 16px;
  padding: 28px 36px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  font-size: 20px;
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
}
</style>
