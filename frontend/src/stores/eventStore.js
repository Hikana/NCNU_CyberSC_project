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
  const ownedDefenses = ref(['waf', 'backup', 'rate_limit']);

  // 防禦建材目錄（全清單）
  const allDefenseCatalog = [
    { key: 'waf', name: 'WAF 應用程式防火牆' },
    { key: 'cdn', name: 'CDN + 流量清洗' },
    { key: 'rate_limit', name: '速率限制 / 流量控管' },
    { key: 'backup', name: '備份 / 異地備援' },
    { key: 'twofa', name: '2FA 多重驗證' },
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

  // —— 隨機觸發機制（先給你一個範例即可用）——
  let nextTimer = null;

  function scheduleFirstEvent() {
    if (nextTimer) clearTimeout(nextTimer);
    // 打開遊戲後 10 秒觸發一次 DDoS，倒數 30 秒
    nextTimer = setTimeout(() => startEvent('ddos', 30), 10_000);
  }

  function scheduleNextRandomEvent() {
    if (nextTimer) clearTimeout(nextTimer);
    // 之後每 60~120 秒隨機觸發一次（可自行調整）
    const ms = 60_000 + Math.floor(Math.random() * 60_000);
    nextTimer = setTimeout(() => startEvent('ddos', 30), ms);
  }

  // 元件卸載保險（通常不會在根元件卸載到）
  onUnmounted(() => {
    clearTimer();
    if (nextTimer) clearTimeout(nextTimer);
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
    scheduleNextRandomEvent,
  };
});