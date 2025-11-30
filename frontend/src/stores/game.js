// src/stores/game.js
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
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
  const showBingoAnimation = ref(false); // 控制 bingo 動畫顯示

  /**
   * 開始解鎖流程
   * @param {object} coords - 要解鎖的地塊座標 { x, y }
   */
  function startUnlockProcess(coords) {
    // 防止在題目已開啟時重複觸發
    if (isAnswering.value) {
      return;
    }
    tileToUnlock.value = coords;
    // 先標記為作答中，避免 API 回來前的重複觸發
    isAnswering.value = true;
    fetchRandomQuestion();
  }

  /**
   * 從後端獲取一道隨機題目
   */
  async function fetchRandomQuestion() {
    try {
      // 若已在作答中且已有題目，則不重複請求；
      // 但若尚未有題目，仍需發出請求
      if (isAnswering.value && currentQuestion.value) return;
      // 檢查用戶是否已登入
      const authStore = useAuthStore();
      if (!authStore.user) {
        console.error('用戶未登入，無法獲取題目');
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
      } 
      // 失敗時恢復狀態，允許再次嘗試
      isAnswering.value = false;
    }
  }

  /**
   * 提交答案，並在答對時觸發解鎖
   * @param {number} userAnswerIndex - 玩家選擇的答案索引
   */
  async function submitAnswer(userAnswerIndex) {
    if (!currentQuestion.value) return;
    if (typeof userAnswerIndex !== 'number' || Number.isNaN(userAnswerIndex)) {
      return;
    }

    const buildingStore = useBuildingStore();
    const historyStore = useHistoryStore();
    const targetTile = tileToUnlock.value
      ? { x: tileToUnlock.value.x, y: tileToUnlock.value.y }
      : null;
    

    try {
      const apiResult = await apiService.submitAnswer(
        currentQuestion.value.id,
        userAnswerIndex
      );
      // 統一結果結構：將後端包在 gameData 的欄位提升到頂層
      const result = {
        ...apiResult,
        ...(apiResult?.gameData || {})
      };

      // 檢查必要屬性
      if (result.isCorrect === undefined) {
        throw new Error('後端回應缺少 isCorrect 屬性');
      }

      // 更新歷史記錄（不阻塞主流程）
      if (result.newHistory) {
        historyStore.addUserHistoryEntry(result.newHistory);
      }

      // 處理答題結果：根據後端返回的結果直接更新本地狀態，減少 API 調用
      const playerStore = usePlayerStore();
      if (result.updatedPlayerData) {
        playerStore.updatePlayerDataLocal(result.updatedPlayerData);
      } else {
        // 後備方案：如果後端沒有返回更新資料，則重新載入（理論上不會執行）
        await playerStore.refreshPlayerData();
      }

      // 非關鍵操作：完全異步執行，不阻塞主流程
      // 1. 更新背包（如果獲得防禦工具）
      if (result.isCorrect && result.defenseTool && result.defenseTool.success) {
        const inventoryStore = useInventoryStore();
        inventoryStore.refreshInventory().catch(() => {}); // 靜默失敗，不影響主流程
      }
      
      // 2. 同步城堡等級（因為防禦值可能已經改變）
      import('./wall').then(({ useWallStore }) => {
        const wallStore = useWallStore();
        wallStore.syncCastleLevel().catch(() => {}); // 靜默失敗
      }).catch(() => {}); // 靜默失敗
      
      // 3. 播放音效
      if (!result.isCorrect) {
        import('@/services/audioService').then(({ audioService }) => {
          audioService.playWrongAnswerSound().catch(() => {});
        }).catch(() => {}); // 靜默失敗
      }

      if (result.isCorrect && targetTile) {
        (async () => {
          try {
            const currentUserId = playerStore.playerId || userId.value || 'test-user';
            const unlockResponse = await apiService.unlockTile(targetTile, currentUserId);
            if (unlockResponse.success) {
              const responseData = unlockResponse.data;
              

              if (responseData.map && Array.isArray(responseData.map)) {
                buildingStore.map = responseData.map;
              } else if (responseData.map && typeof responseData.map === 'object') {
                const size = 20;
                buildingStore.map = Array.from({ length: size }, (_, y) =>
                  Array.from({ length: size }, (_, x) => responseData.map[y]?.[x] || { status: 'locked' })
                );
              }
              
              if (responseData.triggeredEvent) {
                // 等待答題 UI 完全關閉後 5 秒再顯示資安事件
                const { useEventStore } = await import('./eventStore');
                const eventStore = useEventStore();
                
                // 如果答題 UI 已經關閉，直接等待 5 秒
                if (!isAnswering.value) {
                  setTimeout(() => {
                    eventStore.startEvent(responseData.triggeredEvent.type, 30);
                  }, 1000);
                } else {
                  // 如果還在答題中，監聽 isAnswering 的變化
                  const stopWatcher = watch(isAnswering, (newValue) => {
                    if (!newValue) {
                      // 答題 UI 已關閉，停止監聽並等待 5 秒後顯示事件
                      stopWatcher();
                      setTimeout(() => {
                        eventStore.startEvent(responseData.triggeredEvent.type, 30);
                      }, 1000);
                    }
                  });
                }
              }

            }
          } catch (error) {
            console.error('解鎖地塊或觸發事件失敗:', error);
          }
        })();
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
    // 關閉問題時也關閉 bingo 動畫
    showBingoAnimation.value = false;
  }

  function closeBingoAnimation() {
    showBingoAnimation.value = false;
  }

  function resetStore() {
    currentQuestion.value = null;
    isAnswering.value = false;
    tileToUnlock.value = null;
    userId.value = null;
    showBingoAnimation.value = false;
  }

  return {
    currentQuestion,
    isAnswering,
    tileToUnlock,
    showBingoAnimation,
    startUnlockProcess,
    fetchRandomQuestion,
    submitAnswer,
    closeQuestion,
    closeBingoAnimation,
    resetStore,
  };
});