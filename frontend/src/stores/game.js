// src/stores/game.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '@/services/apiService';
import { useBuildingStore } from './buildings';
import { useHistoryStore } from './historyStore';
import { usePlayerStore } from './player'; // 確保 playerStore 也被引入
import { useInventoryStore } from './inventory'; // 引入背包 store
import { useAuthStore } from './authStore'; // 引入認證 store

export const useGameStore = defineStore('game', () => {
  // --- State ---
  const currentQuestion = ref(null);
  const isAnswering = ref(false);
  const tileToUnlock = ref(null); // 要解鎖的地塊座標
  const userId = ref(null); // 將從 playerStore 獲取真實的 userId

  // --- Actions ---

  /**
   * 開始解鎖流程
   * @param {object} coords - 要解鎖的地塊座標 { x, y }
   */
  function startUnlockProcess(coords) {
    tileToUnlock.value = coords;
    fetchRandomQuestion();
  }

  /**
   * 從後端獲取一道隨機題目
   */
  async function fetchRandomQuestion() {
    try {
      // 檢查用戶是否已登入
      const authStore = useAuthStore();
      if (!authStore.user) {
        console.error('用戶未登入，無法獲取題目');
        alert('請先登入後再進行遊戲');
        return;
      }

      const response = await apiService.getRandomQuestion();
      if (response.success) {
        currentQuestion.value = response.data;
        isAnswering.value = true; // 打開題目彈窗
      }
    } catch (err) {
      console.error('獲取題目失敗:', err);
      if (err.message.includes('認證失敗') || err.message.includes('No token')) {
        alert('認證失敗，請重新登入');
      } else {
        alert('獲取題目時發生錯誤，請稍後再試');
      }
    }
  }

  /**
   * 提交答案，並在答對時觸發解鎖
   * @param {number} userAnswerIndex - 玩家選擇的答案索引
   */
  async function submitAnswer(userAnswerIndex) {
    if (!currentQuestion.value) return;

    const buildingStore = useBuildingStore();
    const historyStore = useHistoryStore();
    

    try {
      const result = await apiService.submitAnswer(
        currentQuestion.value.id,
        userAnswerIndex
      );
      /*const correctAnswerText = result.correctAnswer || '未知';
      alert(result.isCorrect ? '答對了！' : `答錯了！正確答案是: ${correctAnswerText}`);
*/
      console.log('後端回應:', result);

      // ✅ 檢查必要屬性
      if (result.isCorrect === undefined) {
        throw new Error('後端回應缺少 isCorrect 屬性');
      }

      if (result.newHistory) {
          historyStore.addUserHistoryEntry(result.newHistory);
          console.log("✅ 歷史記錄已即時更新:", result.newHistory);
      } else {
          console.warn('後端未回傳 newHistory 物件');
      }

      // ✅ 立即更新歷史記錄
      /*historyStore.addHistoryEntry(newHistoryEntry);
      console.log('✅ 歷史記錄已即時更新:', newHistoryEntry);*/

      // 處理答題結果（不使用 alert，改由呼叫端決定顯示方式）
      if (result.isCorrect) {
        // 🎁 顯示獎勵信息
        let rewardMessage = '答對了！土地已解鎖！\n🎁 獲得獎勵：\n+50 科技點\n+10 防禦值';
        
        // 如果有獲得防禦工具，顯示額外獎勵
        if (result.defenseTool && result.defenseTool.success) {
          rewardMessage += `\n🛡️ 獲得防禦工具：${result.defenseTool.tool.name}`;
        }
        
        alert(rewardMessage);

        // 更新玩家數值（後端已經自動發放獎勵，這裡只需要重新載入資料）
        const playerStore = usePlayerStore();
        await playerStore.refreshPlayerData();
        
        // 更新背包資料（如果有獲得防禦工具）
        if (result.defenseTool && result.defenseTool.success) {
          const inventoryStore = useInventoryStore();
          await inventoryStore.refreshInventory();
        }

        if (tileToUnlock.value) {
          const currentUserId = playerStore.playerId || userId.value || 'test-user';
     
          const unlockResponse = await apiService.unlockTile(tileToUnlock.value, currentUserId);
          if (unlockResponse.success) {
            const responseData = unlockResponse.data;
            
            // 處理地圖更新
            if (responseData.map && Array.isArray(responseData.map)) {
              // 後端已回傳 2D 陣列，直接套用
              buildingStore.map = responseData.map;
            } else if (responseData.map && typeof responseData.map === 'object') {
              // 保險：若回傳為物件(以 y_x 為鍵)，轉成 20x20 陣列
              const size = 20;
              buildingStore.map = Array.from({ length: size }, (_, y) =>
                Array.from({ length: size }, (_, x) => responseData.map[y]?.[x] || { status: 'locked' })
              );
            }
            
            // 🎲 處理觸發的事件
            if (responseData.triggeredEvent) {
              console.log('🎲 觸發隨機事件:', responseData.triggeredEvent);
              
              // 導入事件store並觸發事件
              const { useEventStore } = await import('./eventStore');
              const eventStore = useEventStore();
              
              // 觸發事件（使用事件類型）
              eventStore.startEvent(responseData.triggeredEvent.type, 30);
            }
          }
        }
      }
      // 將結果回傳給呼叫端（例如 QuizPanel 用於翻面顯示）
      return result;
    } catch (err) {
      console.error('提交答案失敗:', err);
      throw err;
    }
  }

  /**
   * 關閉問題彈窗並重置狀態
   */
  function closeQuestion() {
    isAnswering.value = false;
    currentQuestion.value = null;
    tileToUnlock.value = null;
  }

  return {
    currentQuestion,
    isAnswering,
    tileToUnlock,
    startUnlockProcess,
    fetchRandomQuestion,
    submitAnswer,
    closeQuestion
  };
});