import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { EVENTS } from '../game/events';

export const useEventStore = defineStore('event', () => {
  const isModalOpen = ref(false);
  const flipped = ref(false); // true = 顯示背面（結果、案例）
  const status = ref('idle'); // 'idle' | 'pending' | 'success' | 'fail'
  const activeEventId = ref(null);
  const timeLeft = ref(0);
  const intervalId = ref(null);
  const resultMessage = ref('');

  // Demo：暫時假裝玩家已取得的防禦建材（之後可由後端/存檔灌入）
  const ownedDefenses = ref(['waf', 'prepared_statements', 'output_encoding', 'csrf_token', 'mfa']);

  // 防禦建材目錄（全清單）
  const allDefenseCatalog = [
    { key: 'waf', name: 'WAF 應用程式防火牆', description: '像一堵超強水壩，把敵人洪流分散、導流，不會一次壓垮城門' },
    { key: 'prepared_statements', name: 'Prepared Statements（參數化查詢）', description: '守門官只認「合法口令」，奇怪的字句會被擋下' },
    { key: 'output_encoding', name: 'Output Encoding（輸出編碼）', description: '所有怪異符號透過水晶窗時會自動被「過濾」，變成無害的圖案' },
    { key: 'csrf_token', name: 'CSRF Token（隨機驗證碼）', description: '每次國王下令，必須附上「獨特石板碎片」，外人無法輕易偽造' },
    { key: 'mfa', name: 'MFA（多因素驗證）', description: '就算有人帶上千鑰匙，也還需要「魔法咒語」或「指紋」才能打開' },
    { key: 'security_awareness_training', name: 'Security Awareness Training（資安意識訓練）', description: '城內掛上一道魔眼布條，能讓士兵一眼看穿假印章、假字跡' },
    { key: 'tls_https', name: 'TLS/HTTPS 加密', description: '信鴿必須經過密語管道，內容被加密，敵人就算偷到也看不懂' },
    { key: 'backup_321', name: '定期備份（3-2-1 備份原則）', description: '就算糧倉被上鎖，地下密室還存有乾糧，百姓不至於餓死' },
    { key: 'least_privilege', name: 'Least Privilege（最小權限原則）', description: '清潔工只能拿掃帚，無論穿上誰的盔甲，都無法下達軍令' },
    { key: 'httponly_secure_cookie', name: 'HttpOnly & Secure Cookie 屬性', description: '令牌一旦過時，就會自動燃燒，敵人偷到也無用' },
    { key: 'dnssec', name: 'DNSSEC（Domain Name System Security Extensions）', description: '城門外立了一塊魔法石碑，所有路牌都必須對應石碑，否則視為假路' },
    { key: 'code_signing', name: 'Code Signing（軟體簽章驗證）', description: '每袋糧食出廠封袋時都要打上獨特的蠟印，若印章破損就不能進城' },
  ];

  const availableDefenses = computed(() =>
    allDefenseCatalog.map((d) => ({ ...d, owned: ownedDefenses.value.includes(d.key) }))
  );

  const currentEvent = computed(() =>
    activeEventId.value ? EVENTS[activeEventId.value] : null
  );

  function clearTimer() {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  }

  function finalize(success, message) {
    clearTimer();
    status.value = success ? 'success' : 'fail';
    resultMessage.value = message || '';
    flipped.value = true; // 翻到背面顯示結果與真實案例
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

    // 未取得建材 → 不允許使用（僅提示，不翻面）
    if (!ownedDefenses.value.includes(key)) {
      resultMessage.value = '你尚未取得這項防禦建材！';
      return;
    }

    const ev = currentEvent.value;
    if (!ev) return;

    const isCorrect = ev.correctDefenses.includes(key);
    finalize(
      isCorrect,
      isCorrect ? '成功抵禦 DDoS！' : '防禦無效（與攻擊樣態不相符）。'
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

  function scheduleFirstEvent() {
    // 在遊戲開始時安排第一個事件
    // 可以設定延遲時間，讓玩家先熟悉遊戲環境
    setTimeout(() => {
      startEvent('ddos', 30);
    }, 5000); // 5秒後開始第一個事件
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
    scheduleFirstEvent,
  };
});