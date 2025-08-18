import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService'; 
import { useHistoryStore } from './historyStore';
import { usePlayerStore } from './player'; // 確保 playerStore 也被引入

export const useGameStore = defineStore('game', {
  state: () => ({
    currentQuestion: null,
    isAnswering: false,
    isLoading: false,
    error: null,
  }),
  actions: {
    /**
     * 【智慧版】獲取隨機問題
     * 會根據玩家答對題數，動態調整請求的題目等級
     */
    async fetchRandomQuestion() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.error = null;
      
      const playerStore = usePlayerStore(); // 取得 player store 實例
      
      // 根據玩家答對題數，決定要請求哪個等級的題目
      let levelToFetch = 1;
      if (playerStore.correctlyAnsweredCount >= 10) {
        levelToFetch = 3;
      } else if (playerStore.correctlyAnsweredCount >= 5) {
        levelToFetch = 2;
      }
      
      console.log(`根據答對題數 ${playerStore.correctlyAnsweredCount}，請求 Level ${levelToFetch} 的題目`);

      try {
        // 將計算出的等級傳給 API
        const questionData = await apiService.getRandomQuestion(levelToFetch);
        
        this.currentQuestion = questionData;
        this.isAnswering = true;
      } catch (err) {
        console.error('從後端取得題目失敗:', err);
        this.error = err.message;
        alert(`取得題目失敗: ${err.message}`);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 【智慧版】提交答案
     * 答對時會通知 playerStore 更新進度
     */
    async submitAnswer(userAnswer) {
      if (!this.currentQuestion) return;

      const historyStore = useHistoryStore();
      const playerStore = usePlayerStore(); // 取得 player store 實例

      try {
        const result = await apiService.validateAnswer(this.currentQuestion.id, userAnswer);
        alert(result.isCorrect ? '答對了！' : `答錯了！正確答案是: ${result.correctAnswer}`);
        
        // 如果答對了，就呼叫 playerStore 的 action 來增加計數
        if (result.isCorrect) {
          playerStore.incrementCorrectlyAnsweredCount();
        }

        // 將作答結果記錄到 history
        await historyStore.addHistoryEntry({
          questionId: this.currentQuestion.id,
          questionText: this.currentQuestion.question,
          userAnswer: userAnswer,
          isCorrect: result.isCorrect,
        });

        this.closeQuestion();
      } catch(err) {
        alert(`提交答案失敗: ${err.message}`);
      }
    },

    closeQuestion() {
        this.isAnswering = false;
        this.currentQuestion = null;
    }
  },
});