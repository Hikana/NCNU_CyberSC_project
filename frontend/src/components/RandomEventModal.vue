<!-- src/components/RandomEventModal.vue -->
<template>
  <div v-if="store.isModalOpen" class="re-modal" role="dialog" aria-modal="true">
    <div class="re-backdrop"></div>
    <div class="re-dialog" role="document">
      <div class="flip-container">
        <div class="card" :class="{ flipped: store.flipped }">
          <!-- Front: 事件內容 + 倒數 + 防禦選項 -->
          <section class="card-face front" v-if="store.currentEvent">
            <header class="title">
              <h2>{{ store.currentEvent.name }}</h2>
              <small class="learn">學習：{{ store.currentEvent.shortExplain }}</small>
            </header>

            <div class="timer">
              <div class="time" :aria-label="'剩餘秒數 ' + store.timeLeft">{{ store.timeLeft }} 秒</div>
              <div class="bar" aria-hidden="true">
                <div class="bar-inner" :style="{ width: percent + '%' }"></div>
              </div>
            </div>

            <p class="desc">{{ store.currentEvent.gameDescription }}</p>

            <div class="options">
              <button
                v-for="opt in store.availableDefenses"
                :key="opt.key"
                class="opt-btn"
                :class="{ locked: !opt.owned }"
                :disabled="!opt.owned || store.status !== 'pending'"
                @click="onDefenseClick(opt.key, opt.owned)"
              >
                <span class="opt-name">{{ opt.name }}</span>
                <span class="badge" :class="opt.owned ? 'ok' : 'no'">
                  {{ opt.owned ? '已取得' : '未取得' }}
                </span>
              </button>
            </div>

            <footer class="actions">
              <button class="ghost" :disabled="store.status !== 'pending'" @click="store.chooseDefense('skip')">
                不採取動作
              </button>
            </footer>
          </section>

          <!-- Back: 結果 + 失敗後果 + 現實案例 -->
          <section class="card-face back" v-if="store.currentEvent">
            <header class="title">
              <h2>
                <span v-if="store.status === 'success'">✅ 防禦成功</span>
                <span v-else>❌ 防禦失敗</span>
              </h2>
              <small v-if="store.resultMessage" class="result-msg">{{ store.resultMessage }}</small>
            </header>

            <div v-if="store.status === 'fail'" class="penalty">
              <h3>失敗後果（遊戲效果）</h3>
              <p>{{ store.currentEvent.failureConsequence }}</p>
            </div>

            <div class="realcase">
              <h3>現實世界案例</h3>
              <p class="rc-title"><strong>{{ store.currentEvent.realCase.title }}</strong></p>
              <p class="rc-body">{{ store.currentEvent.realCase.body }}</p>
            </div>

            <footer class="actions">
              <button class="primary" @click="store.closeModal()">關閉</button>
            </footer>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useEventStore } from '../stores/eventStore';

const store = useEventStore();

const percent = computed(() => {
  const ev = store.currentEvent;
  if (!ev) return 0;
  const p = Math.round((store.timeLeft / ev.timerSeconds) * 100);
  return Math.max(0, Math.min(100, p));
});

function onDefenseClick(key, owned) {
  if (!owned) return; // 未取得時不動作（僅顯示標籤提示）
  store.chooseDefense(key);
}
</script>

<style scoped>
/* —— 版面 —— */
.re-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
}
.re-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}
.re-dialog {
  position: relative;
  width: min(920px, 92vw);
  padding: 16px;
}

/* —— 翻轉卡片 —— */
.flip-container {
  perspective: 1400px;
}
.card {
  position: relative;
  width: 100%;
  min-height: 420px;
  transform-style: preserve-3d;
  transition: transform 560ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.card.flipped {
  transform: rotateY(180deg);
}
.card-face {
  position: absolute;
  inset: 0;
  background: #111827; /* slate-900 */
  color: #e5e7eb; /* gray-200 */
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  padding: 20px 22px;
  backface-visibility: hidden;
}
.card-face.back {
  transform: rotateY(180deg);
}

/* —— 元素樣式 —— */
.title h2 {
  margin: 4px 0 6px;
  font-size: 22px;
}
.title .learn,
.title .result-msg {
  color: #9ca3af; /* gray-400 */
}
.desc { margin: 10px 0 14px; }

.timer { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; }
.time {
  font-variant-numeric: tabular-nums;
  font-size: 20px;
  padding: 6px 10px;
  background: #1f2937; /* gray-800 */
  border-radius: 10px;
}
.bar { height: 10px; background: #374151; border-radius: 999px; overflow: hidden; }
.bar-inner { height: 100%; background: #60a5fa; /* blue-400 */ width: 0; transition: width 300ms linear; }

.options { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 8px; }
.opt-btn { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 14px; background: #0b1220; border: 1px solid #1f2937; }
.opt-btn:hover { border-color: #374151; }
.opt-btn.locked { opacity: 0.55; }
.opt-btn:disabled { cursor: not-allowed; }
.opt-name { font-size: 15px; }
.badge { font-size: 12px; padding: 3px 8px; border-radius: 999px; }
.badge.ok { background: #065f46; color: #d1fae5; }
.badge.no { background: #7f1d1d; color: #fee2e2; }

.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
button.primary { background: #2563eb; color: white; padding: 10px 14px; border-radius: 12px; }
button.ghost { background: transparent; color: #93c5fd; padding: 10px 14px; border: 1px solid #1f2937; border-radius: 12px; }
button { border: none; font-weight: 600; }
button:disabled { opacity: 0.6; }

/* 區塊標題 */
.penalty h3, .realcase h3 { margin: 8px 0; font-size: 16px; color: #93c5fd; }
.rc-title { margin: 6px 0 4px; }
.rc-body { color: #cbd5e1; }
</style>