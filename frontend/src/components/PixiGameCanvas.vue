<template>
  <div ref="pixiContainer" class="pixi-canvas"></div>
  
  <div v-if="buildingStore.isPlacing" class="placement-ui">
    <div class="placement-info">
      <p>選擇位置放置建築</p>
      <p v-if="buildingStore.selectedTile">
        選擇位置: ({{ buildingStore.selectedTile.x }}, {{ buildingStore.selectedTile.y }})
      </p>
      <p style="color: orange;">請點擊地圖上的可建造土地</p>
    </div>
    <div class="placement-controls">
      <button 
        v-if="buildingStore.selectedTile" 
        @click="confirmPlacement"
        class="confirm-btn"
      >
        確認建造
      </button>
      <button @click="cancelPlacement" class="cancel-btn">
        取消
      </button>
    </div>
  </div>

  <!-- 刪除建築 UI -->
  <div v-if="buildingStore.deleteTarget" class="delete-ui">
    <div class="delete-panel">
      <div class="title">刪除建築</div>
      <div class="desc">位置 ({{ buildingStore.deleteTarget.x }}, {{ buildingStore.deleteTarget.y }})</div>
      <div class="actions">
        <button class="danger" @click="confirmDelete">刪除</button>
        <button class="ghost" @click="cancelDelete">取消</button>
      </div>
    </div>
  </div>

  <!-- 放置限制訊息（取代 alert） -->
  <div v-if="buildingStore.placementMessage" class="toast">
    {{ buildingStore.placementMessage }}
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useBuildingStore } from '@/stores/buildings';
import { Game } from '@/game/Game.js';

const pixiContainer = ref(null);
const buildingStore = useBuildingStore();
let gameInstance = null;

onMounted(async () => {
  if (pixiContainer.value) {
    // 建立遊戲實例，它會自己處理所有事
    gameInstance = new Game(pixiContainer.value);
    await gameInstance.init();
    console.log('✅ PixiGameCanvas.vue: Game 引擎已啟動，並由 Game.js 自主管理');
  }
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy();
  }
});

// 這兩個方法只呼叫 store，非常乾淨
function confirmPlacement() {
  buildingStore.confirmPlacement();
}

function cancelPlacement() {
  buildingStore.setPlacementMode(false);
}

function confirmDelete() {
  const tgt = buildingStore.deleteTarget;
  if (!tgt) return;
  buildingStore.clearBuildingAt(tgt.x, tgt.y);
}

function cancelDelete() {
  buildingStore.cancelDeletePrompt();
}
</script>


<style scoped>
.pixi-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  min-width: 100vw;
  min-height: 100vh;
}

.pixi-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.delete-ui {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
}

.delete-panel {
  background: #a9b39ef3;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  min-width: 300px;
}
.delete-panel .title {
  font-weight: 700;
  margin-bottom: 8px;
}
.delete-panel .desc {
  color: #4b5563;
  margin-bottom: 12px;
}
.delete-panel .actions { display: flex; gap: 10px; }
.delete-panel .danger {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.delete-panel .danger:hover { background: #b91c1c; }
.delete-panel .ghost {
  background: #d3f1d7;
  color: #111827;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.delete-panel .ghost:hover { background: #e5e7eb; }

.toast {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: #fff;
  padding: 16px 22px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  z-index: 300;
  max-width: 560px;
  font-size: 18px;
  line-height: 1.4; 
}

.placement-ui {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 150; /* 恢復原來的高層級 */
  min-width: 250px;
  pointer-events: auto;
}

.placement-info {
  margin-bottom: 10px;
}

.placement-info p {
  margin: 5px 0;
  color: #333;
  font-size: 14px;
}

.placement-controls {
  display: flex;
  gap: 10px;
}

.confirm-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.confirm-btn:hover {
  background: #45a049;
}

.cancel-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.cancel-btn:hover {
  background: #da190b;
}
</style>