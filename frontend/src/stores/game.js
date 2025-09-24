import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService'; 
import { useHistoryStore } from './historyStore';
import { usePlayerStore } from './player'; // 確保 playerStore 也被引入
import { useInventoryStore } from './inventory'; // 引入背包 store

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
          
          // 添加物品獎勵到背包
          await this.giveRewardItems(playerStore.correctlyAnsweredCount);
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
    },

    /**
     * 根據答對題數給予物品獎勵
     */
    async giveRewardItems(correctCount) {
      const inventoryStore = useInventoryStore();
      
      // 確保背包已初始化
      if (!inventoryStore.userId) {
        await inventoryStore.init();
      }

      // 定義獎勵物品
      const rewardItems = [
        { id: 'waf', key: 'waf', name: 'WAF 應用程式防火牆', desc: '防禦 SQL 注入和 XSS 攻擊', qty: 1 },
        { id: 'cdn', key: 'cdn', name: 'CDN + 流量清洗', desc: '分散式防禦 DDoS 攻擊', qty: 1 },
        { id: 'rate_limit', key: 'rate_limit', name: '速率限制', desc: '限制請求頻率防止濫用', qty: 1 },
        { id: 'backup', key: 'backup', name: '備份系統', desc: '異地備援確保資料安全', qty: 1 },
        { id: 'twofa', key: 'twofa', name: '2FA 多重驗證', desc: '雙重驗證提升帳號安全', qty: 1 }
      ];

      // 根據答對題數給予不同獎勵
      let rewards = [];
      if (correctCount === 1) {
        rewards = [rewardItems[0]]; // WAF
      } else if (correctCount === 3) {
        rewards = [rewardItems[1]]; // CDN
      } else if (correctCount === 5) {
        rewards = [rewardItems[2]]; // Rate Limit
      } else if (correctCount === 10) {
        rewards = [rewardItems[3]]; // Backup
      } else if (correctCount === 15) {
        rewards = [rewardItems[4]]; // 2FA
      } else if (correctCount % 5 === 0 && correctCount > 15) {
        // 每5題隨機給一個物品
        const randomIndex = Math.floor(Math.random() * rewardItems.length);
        rewards = [rewardItems[randomIndex]];
      }

      // 添加獎勵物品到背包
      for (const item of rewards) {
        await inventoryStore.addItem(item);
        console.log(`獲得獎勵物品: ${item.name}`);
      }

      if (rewards.length > 0) {
        alert(`恭喜！你獲得了 ${rewards.map(r => r.name).join('、')}！`);
      }


      
    }
  },
});