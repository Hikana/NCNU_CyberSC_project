<template>
  <div class="history-panel">
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
        <!-- 顯示題目 -->
        <p class="question">題目：{{ entry.questionTitle }}</p>

        <!-- 顯示玩家答案 - 修正欄位名稱 -->
        <p class="answer">你的答案: {{ entry.yourAnswer || entry.userAnswer || '未知' }}</p>
        <p class="answer">解釋: {{ entry.description}}</p>
        <!-- 錯誤才顯示正確答案 -->
        <p v-if="!entry.isCorrect" class="correct-answer">
          正確答案: {{ entry.correctAnswer }}
        </p>

        
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
  overflow: visible;
  padding-right: 10px;
}
.history-item {
  background-color: rgba(47, 15, 25, 0.116);
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
.correct-answer {
  color: #34495e;
}
.loading, .error, .empty {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2em;
  color: #7f8c8d;
}
</style>