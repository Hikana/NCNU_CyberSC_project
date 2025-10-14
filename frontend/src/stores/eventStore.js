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
    { key: 'waf', name: 'WAF 應用程式防火牆', description: '像一堵超強水壩，把敵人洪流分散、導流，不會一次壓垮城門' },
    { key: 'prepared_statements', name: 'Prepared Statements（參數化查詢）', description: '守門官只認「合法口令」，奇怪的字句會被擋下' },
    { key: 'output_encoding', name: 'Output Encoding（輸出編碼）', description: '所有怪異符號透過水晶窗時會自動被「過濾」，變成無害的圖案' },
    { key: 'csrf', name: 'CSRF Token（隨機驗證碼）', description: '每次國王下令，必須附上「獨特石板碎片」，外人無法輕易偽造' },
    { key: 'mfa', name: 'MFA（多因素驗證）', description: '就算有人帶上千鑰匙，也還需要「魔法咒語」或「指紋」才能打開' },
    { key: 'security_awareness', name: 'Security Awareness Training（資安意識訓練）', description: '城內掛上一道魔眼布條，能讓士兵一眼看穿假印章、假字跡' },
    { key: 'tls_https', name: 'TLS/HTTPS 加密', description: '信鴿必須經過密語管道，內容被加密，敵人就算偷到也看不懂' },
    { key: 'backup', name: '定期備份（3-2-1 備份原則）', description: '就算糧倉被上鎖，地下密室還存有乾糧，百姓不至於餓死' },
    { key: 'least_privilege', name: 'Least Privilege（最小權限原則）', description: '清潔工只能拿掃帚，無論穿上誰的盔甲，都無法下達軍令' },
    { key: 'http_cookie', name: 'HttpOnly & Secure Cookie 屬性', description: '令牌一旦過時，就會自動燃燒，敵人偷到也無用' },
    { key: 'dnssec', name: 'DNSSEC（Domain Name System Security Extensions）', description: '城門外立了一塊魔法石碑，所有路牌都必須對應石碑，否則視為假路' },
    { key: 'code_signing', name: 'Code Signing（軟體簽章驗證）', description: '每袋糧食出廠封袋時都要打上獨特的蠟印，若印章破損就不能進城' },
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
        console.log('🔴 事件失敗，準備記錄到資安事件:', event.name);
        
        // 立即扣除科技點50和防禦值10
        const newTechPoints = Math.max(0, playerStore.techPoints - 50);
        const newDefense = Math.max(0, playerStore.defense - 10);
        
        console.log('💰 扣除懲罰: 科技點 -50, 防禦值 -10');
        console.log(`   科技點: ${playerStore.techPoints} → ${newTechPoints}`);
        console.log(`   防禦值: ${playerStore.defense} → ${newDefense}`);
        
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
        
        console.log('📝 準備發送的事件資料:', eventData);
        
        eventLogStore.addSecurityEvent(eventData)
          .then(result => {
            console.log('✅ 資安事件記錄成功:', result);
            // 確認事件已正確添加到 store
            if (result && result.id) {
              console.log('📜 事件已成功添加到 eventLogStore，ID:', result.id);
            } else {
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