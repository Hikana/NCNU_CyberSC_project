import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { EVENTS } from '../game/events';
import { useInventoryStore } from './inventory';
import { useEventLogStore } from './eventLogStore';
import { usePlayerStore } from './player';

export const useEventStore = defineStore('event', () => {
  const isModalOpen = ref(false);
  const flipped = ref(false); // true = 顯示背面（結果、案例）
  const status = ref('idle'); // 'idle' | 'pending' | 'success' | 'fail'
  const activeEventId = ref(null);
  const timeLeft = ref(0);
  const intervalId = ref(null);
  const resultMessage = ref('');

  // 獲取背包、事件紀錄和玩家 store
  const inventoryStore = useInventoryStore();
  const eventLogStore = useEventLogStore();
  const playerStore = usePlayerStore();

  // 防禦建材目錄（全清單）- 與 inventory store 的 DEFENSE_TOOLS 保持一致
  const allDefenseCatalog = [
    { key: 'cdn', name: 'CDN 分流雲網', description: '把爆量流量分散到各地鏟鏟節點，守住伺服器入口' },
    { key: 'prepared_statements', name: 'Prepared Statements（參數化查詢）', description: '資料庫守門官只認合法口令，奇怪語句一個字都進不來' },
    { key: 'output_encoding', name: 'Output Encoding（輸出編碼）', description: '可疑符號會被轉成無害文字魚骨，咒語啟動不了' },
    { key: 'mfa', name: 'MFA（多因素驗證）', description: '除了鑰匙還要肉球驗證' },
    { key: 'code_signing', name: 'Code Signing（軟體簽章驗證）', description: '安裝前先檢查官方爪印簽章，假貨立刻冒煙' },
    { key: 'port_blocking', name: 'Port Blocking（封鎖未用埠口）', description: '把沒用的通訊小洞全部封上，流氓貓找不到入口' },
  ];

  const availableDefenses = computed(() => {
    // 只顯示玩家已擁有的防禦工具
    return allDefenseCatalog
      .filter(d => {
        const item = inventoryStore.getByTemplate(d.key);
        return item && item.qty > 0;
      })
      .map((d) => ({ ...d, owned: true }));
  });

  const currentEvent = computed(() =>
    activeEventId.value ? EVENTS[activeEventId.value] : null
  );

  function clearTimer() {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  }

  async function finalize(success, message) {
    clearTimer();
    status.value = success ? 'success' : 'fail';
    resultMessage.value = message || '';
    flipped.value = true; // 翻到背面顯示結果與真實案例
    
    // 如果事件失敗，記錄到資安事件並立即扣除科技點和防禦值
    if (!success && activeEventId.value) {
      const event = EVENTS[activeEventId.value];
      if (event) {
        const newTechPoints = Math.max(0, playerStore.techPoints - 50);
        const newDefense = Math.max(0, playerStore.defense - 10);
        
        // 更新玩家資料
        await playerStore.updateTechPoints(newTechPoints);
        await playerStore.updateDefense(newDefense);
        
        // 異步記錄事件，不阻塞 UI
        const eventData = {
          id: Date.now(), // 使用時間戳作為唯一 ID
          eventId: activeEventId.value,
          eventName: event.name,
          description: event.gameDescription,
          correctDefenses: event.correctDefenses,
          timestamp: new Date().toISOString() // 使用 ISO 字串格式
        };
        
        eventLogStore.addSecurityEvent(eventData)
          .then(result => {
            if (!result || !result.id) {
              console.warn('⚠️ 事件記錄回應格式異常:', result);
            }
          })
          .catch(error => {
            console.error('❌ 記錄資安事件失敗:', error);
            console.error('錯誤詳情:', error.message, error.stack);
            // 可以考慮顯示錯誤提示給用戶
            console.warn('💡 建議：檢查網路連接和後端服務狀態');
          });
      }
    }
  }

  function startEvent(id = 'ddos', seconds) {
    const ev = EVENTS[id];
    if (!ev) return;

    activeEventId.value = id;
    status.value = 'pending';
    flipped.value = false;
    isModalOpen.value = true;
    timeLeft.value = typeof seconds === 'number' ? seconds : ev.timerSeconds;

    clearTimer();
    intervalId.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value -= 1;
      }
      if (timeLeft.value <= 0) {
        finalize(false, '你沒有在時限內採取行動（逾時）。');
      }
    }, 1000);
  }

  function chooseDefense(key) {
    if (status.value !== 'pending') return;

    if (key === 'skip') {
      finalize(false, '你選擇不採取防禦。');
      return;
    }

    // 檢查是否擁有該工具
    const item = inventoryStore.getByTemplate(key);
    if (!item || item.qty <= 0) {
      resultMessage.value = '你尚未取得這項防禦工具！';
      return;
    }

    const ev = currentEvent.value;
    if (!ev) return;

    const isCorrect = ev.correctDefenses.includes(key);
    finalize(
      isCorrect,
      isCorrect ? '成功抵禦攻擊！' : '防禦無效（與攻擊樣態不相符）。'
    );
  }

  function closeModal() {
    isModalOpen.value = false;
    clearTimer();
    status.value = 'idle';
    activeEventId.value = null;
    timeLeft.value = 0;
    resultMessage.value = '';
    flipped.value = false;
  }

  // 元件卸載保險
  onUnmounted(() => {
    clearTimer();
  });

  return {
    // state
    isModalOpen,
    flipped,
    status,
    activeEventId,
    timeLeft,
    resultMessage,

    // getters
    availableDefenses,
    currentEvent,

    // actions
    startEvent,
    chooseDefense,
    closeModal,
  };
});