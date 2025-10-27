<template>
  <div class="top-bar status-bar">

    <div class="wall-bar"  @click="uiStore.toggleWallMenu()">
      <div class="arrow-label">城牆防禦 🛡️</div>
      <div class="wall-info">
        <span 
          ref="defenseValue"
          :class="{ 'animate-bounce': defenseAnimating}"
          :style="{ color: wallStore.totalDefensePoints < 50 ? 'red' : '#ffffff' }"
        >
          {{ wallStore.defenseProgressText }}
        </span>
        <!-- 浮動數字效果 -->
        <div 
          v-for="(float, index) in floatingDefenseChanges" 
          :key="`defense-${index}`"
          class="floating-number defense-change"
          :class="{ 'negative': float.value < 0 }"
          :style="{ 
            animationDelay: `${index * 0.1}s`,
            left: '50%',
            top: '-20px'
          }"
        >
          {{ float.value > 0 ? '+' : '' }}{{ float.value }}
        </div>
      </div>
    </div>

    <div class="tech-bar">
      <div class="arrow-label">科技點 💰</div>
      <div class="tech-info">
        <span 
          ref="techValue"
          :class="{ 'animate-bounce': techAnimating}"
        >
          {{ playerStore.techPoints }}
        </span>
        <!-- 浮動數字效果 -->
        <div 
          v-for="(float, index) in floatingTechChanges" 
          :key="`tech-${index}`"
          class="floating-number tech-change"
          :class="{ 'negative': float.value < 0 }"
          :style="{ 
            animationDelay: `${index * 0.1}s`,
            left: '50%',
            top: '-20px'
          }"
        >
          {{ float.value > 0 ? '+' : '' }}{{ float.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useWallStore } from '@/stores/wall';
import { useUiStore } from '@/stores/ui';

const playerStore = usePlayerStore();
const wallStore = useWallStore();
const uiStore = useUiStore();

// 動畫狀態
const techAnimating = ref(false);
const defenseAnimating = ref(false);

// 浮動數字陣列
const floatingTechChanges = ref([]);
const floatingDefenseChanges = ref([]);

// 參考元素
const techValue = ref(null);
const defenseValue = ref(null);

// 監聽科技點變化
watch(() => playerStore.techPoints, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    const change = newValue - oldValue;
    triggerTechAnimation(change);
  }
});

// 監聽防禦值變化
watch(() => wallStore.totalDefensePoints, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    const change = newValue - oldValue;
    triggerDefenseAnimation(change);
  }
});

// 觸發科技點動畫
function triggerTechAnimation(change) {
  // 彈跳動畫
  techAnimating.value = true;
  setTimeout(() => {
    techAnimating.value = false;
  }, 600);

  // 浮動數字
  if (change !== 0) {
    floatingTechChanges.value.push({
      value: change,
      id: Date.now() + Math.random()
    });

    // 3秒後移除浮動數字
    setTimeout(() => {
      floatingTechChanges.value.shift();
    }, 3000);
  }
}

// 觸發防禦值動畫
function triggerDefenseAnimation(change) {
  // 彈跳動畫
  defenseAnimating.value = true;
  setTimeout(() => {
    defenseAnimating.value = false;
  }, 600);

  // 浮動數字
  if (change !== 0) {
    floatingDefenseChanges.value.push({
      value: change,
      id: Date.now() + Math.random()
    });

    // 3秒後移除浮動數字
    setTimeout(() => {
      floatingDefenseChanges.value.shift();
    }, 3000);
  }
}

</script>

<style scoped>
.top-bar {
  display: flex;
  gap: 20px;
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 1000;
}

.wall-bar,
.tech-bar {
  display: flex;
  align-items: center;
  background: #68bce9;
  border-radius: 8px;
  padding: 0 15px;
  height: 80px;
  position: relative;
  cursor: pointer;
}

.arrow-label {
  background: #3947c2;
  color: #ffffff;
  padding: 12px 16px 12px 14px;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
  text-align: left;
  line-height: 1.1;
}

.tech-info span,
.wall-info span {
  color: #ffffff;
  margin: 0 6px;
  font-size: 20px;
  font-weight: bolder; 
  transition: all 0.3s ease;
  position: relative;
}

/* 動畫效果 */
.animate-bounce {
  animation: bounce 0.6s ease-in-out;
}

/* 彈跳動畫 - 更明顯的彈跳效果 */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  40%, 43% {
    transform: translate3d(0, -15px, 0) scale(1.3);
  }
  70% {
    transform: translate3d(0, -8px, 0) scale(1.15);
  }
  90% {
    transform: translate3d(0, -4px, 0) scale(1.05);
  }
}

/* 浮動數字樣式 - 放大字體 */
.floating-number {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
  z-index: 1001;
  animation: floatUp 3s ease-out forwards;
}

.tech-change {
  color: #4ade80; /* 綠色 */
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.8);
}

.defense-change {
  color: #60a5fa; /* 藍色 */
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.8);
}

/* 負數顏色 */
.tech-change.negative,
.floating-number.negative {
  color: #f87171; /* 紅色 */
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.8);
}

/* 浮動動畫 - 放大效果更明顯 */
@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-25px) scale(1.4);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
}

/* 容器相對定位，讓浮動數字能正確定位 */
.tech-info,
.wall-info {
  position: relative;
  overflow: visible;
}
</style>