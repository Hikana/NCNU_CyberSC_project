// src/stores/game.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '@/services/apiService';
import { useBuildingStore } from './buildings';
import { useHistoryStore } from './historyStore';

export const useGameStore = defineStore('game', () => {
  // --- State ---
  const currentQuestion = ref(null);
  const isAnswering = ref(false);
  const tileToUnlock = ref(null); // 要解鎖的地塊座標
  const userId = ref("demoUser123"); // ⚠️ 這裡可以改成從 Firebase Auth 拿 UID

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
      const response = await apiService.getRandomQuestion();
      if (response.success) {
        currentQuestion.value = response.data;
        isAnswering.value = true; // 打開題目彈窗
      }
    } catch (err) {
      console.error('獲取題目失敗:', err);
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
        userId.value,
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
          historyStore.addHistoryEntry(result.newHistory);
          console.log("✅ 歷史記錄已即時更新:", result.newHistory);
      } else {
          console.warn('後端未回傳 newHistory 物件');
      }

      // ✅ 立即更新歷史記錄
      /*historyStore.addHistoryEntry(newHistoryEntry);
      console.log('✅ 歷史記錄已即時更新:', newHistoryEntry);*/

      // 處理答題結果
      if (result.isCorrect) {
        alert('答對了！土地已解鎖！');

        if (tileToUnlock.value) {
          const unlockResponse = await apiService.unlockTile(tileToUnlock.value);
          if (unlockResponse.success) {
            const newMap = unlockResponse.data;
            if (Array.isArray(newMap)) {
              // 後端已回傳 2D 陣列，直接套用
              buildingStore.map = newMap;
            } else if (newMap && typeof newMap === 'object') {
              // 保險：若回傳為物件(以 y_x 為鍵)，轉成 20x20 陣列
              const size = 20;
              buildingStore.map = Array.from({ length: size }, (_, y) =>
                Array.from({ length: size }, (_, x) => newMap[y]?.[x] || { status: 'locked' })
              );
            }
          }
        }
      } else {
        alert(`答錯了！正確答案是: ${result.correctAnswer || '未知'}`);
      }

    } catch (err) {
      console.error('提交答案失敗:', err);
      alert('提交答案時發生錯誤，請稍後再試');
    } finally {
      closeQuestion();
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