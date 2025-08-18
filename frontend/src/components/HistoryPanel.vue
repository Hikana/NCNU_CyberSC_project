<template>
  <div class="history-panel">
    <h2>📝 答題紀錄</h2>
    <div v-if="historyStore.isLoading" class="loading">載入中...</div>
    <div v-else-if="historyStore.error" class="error">
      載入失敗: {{ historyStore.error }}
    </div>
    <div v-else-if="historyStore.history.length === 0" class="empty">
      目前沒有任何答題紀錄。
    </div>
    <div v-else class="history-list">
      <div 
        v-for="entry in historyStore.history" 
        :key="entry.id" 
        class="history-item"
        :class="{ correct: entry.isCorrect, incorrect: !entry.isCorrect }"
      >
        <p class="question">{{ entry.questionText }}</p>
        <p class="answer">你的答案: {{ entry.userAnswer }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHistoryStore } from '../stores/historyStore';

const historyStore = useHistoryStore();

// 當元件第一次被掛載時，觸發 action 從後端獲取資料
onMounted(() => {
  // 只有在列表是空的時才去獲取，避免重複載入
  if (historyStore.history.length === 0) {
    historyStore.fetchHistory();
  }
});
</script>

<style scoped>
.history-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.history-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}
.history-item {
  background-color: rgba(255, 255, 255, 0.7);
  border-left: 5px solid;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 10px;
}
.history-item.correct {
  border-left-color: #2ecc71; /* 綠色 */
}
.history-item.incorrect {
  border-left-color: #e74c3c; /* 紅色 */
}
.question {
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #2c3e50;
}
.answer {
  margin: 0;
  color: #34495e;
}
.loading, .error, .empty {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2em;
  color: #7f8c8d;
}
</style>