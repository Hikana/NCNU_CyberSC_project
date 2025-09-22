<template>
  <div class="modal-overlay" v-if="gameStore.isAnswering" @click.self="gameStore.closeQuestion()">
    <div class="modal-content">
      <button class="close-btn" @click="gameStore.closeQuestion()">×</button>
      
      <div v-if="gameStore.isLoading">正在載入題目...</div>
      
      <div v-if="!gameStore.isLoading && gameStore.currentQuestion">
        <h3>問題來了！ ({{ gameStore.currentQuestion.category || '綜合' }})</h3>
        <p class="question-text">{{ gameStore.currentQuestion.question }}</p>
        
        <div class="options-container" v-if="questionHasOptions">
          <button 
            v-for="(option,index) in gameStore.currentQuestion.options" 
            :key="index"
            class="option-btn"
            @click="submit(index)"
          >
            {{ option }}
          </button>
        </div>

        <div class="answer-section" v-else>
          <input 
            type="text" 
            v-model="userAnswer" 
            placeholder="請輸入你的答案..."
            @keyup.enter="submit(userAnswer)"
          />
          <button @click="submit(userAnswer)">提交答案</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();
const userAnswer = ref('');

// 判斷題目是否有選項
const questionHasOptions = computed(() => {
  return gameStore.currentQuestion?.options && gameStore.currentQuestion.options.length > 0;
});

function submit(answerIndex) {
  if (answerIndex === undefined || (typeof answerIndex === 'string' && !answerIndex.trim())) {
    alert('請選擇一個選項或輸入答案！');
    return;
  }
  gameStore.submitAnswer(answerIndex);
  userAnswer.value = ''; // 清空輸入框
}
</script>

<style scoped>
/* ... (modal-overlay, modal-content, close-btn 等樣式不變) ... */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
  pointer-events: auto;
}
.modal-content {
  background: linear-gradient(145deg, #2c3e50, #34495e);
  color: rgb(39, 19, 95);
  padding: 30px 40px; border-radius: 15px; width: 90%;
  max-width: 600px; text-align: center; position: relative;
  border: 2px solid #7f8c8d;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.close-btn {
  position: absolute; top: 10px; right: 15px; background: none;
  border: none; font-size: 28px; cursor: pointer; color: #bdc3c7;
  transition: color 0.2s;
}
.close-btn:hover { color: white; }
h3 { color: #f1c40f; }
.question-text { font-size: 1.5em; margin: 20px 0; line-height: 1.5; }

/* 新增的選項樣式 */
.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2x2 網格 */
  gap: 15px;
  margin-top: 20px;
}
.option-btn {
  padding: 15px;
  font-size: 1.1em;
  cursor: pointer;
  border: 2px solid #3498db;
  background-color: transparent;
  color: #3498db;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.option-btn:hover {
  background-color: #3498db;
  color: white;
  transform: translateY(-2px);
}

/* 原有的輸入框樣式 */
.answer-section { display: flex; gap: 10px; margin-top: 20px; }
.answer-section input {
  flex-grow: 1; padding: 12px; font-size: 1em;
  border: 1px solid #7f8c8d; border-radius: 5px;
  background-color: #5d6d7e; color: white;
}
.answer-section button {
  padding: 12px 20px; font-size: 1em; cursor: pointer; border: none;
  background-color: #2ecc71; color: white; border-radius: 5px;
  transition: background-color 0.2s;
}
.answer-section button:hover { background-color: #27ae60; }
</style>