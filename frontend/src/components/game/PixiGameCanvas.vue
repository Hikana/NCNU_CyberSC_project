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

  <!-- 建築操作選擇 UI -->
  <div v-if="buildingStore.deleteTarget" class="building-operation-ui">
    <div class="operation-panel">
      <div class="title">選擇你想要對建築做的操作</div>
      <div class="desc">位置 ({{ buildingStore.deleteTarget.x }}, {{ buildingStore.deleteTarget.y }})</div>
      <div class="actions">
        <button class="danger" @click="confirmDelete">拆除</button>
        <button class="connect" @click="connectBuilding">連線</button>
        <button class="ghost" @click="cancelDelete">取消</button>
      </div>
    </div>
  </div>

  <!-- 放置限制訊息（取代 alert） -->
  <div v-if="buildingStore.placementMessage" class="toast tile-developed">
    <div class="message-content">
      <div class="message-icon">🚫</div>
      <div class="message-text">{{ buildingStore.placementMessage }}</div>
    </div>
  </div>

  <!-- 土地已開發提示訊息 -->
  <div v-if="buildingStore.tileDevelopedMessage" class="toast tile-developed">
    <div class="message-content">
      <div class="message-text">{{ buildingStore.tileDevelopedMessage }}</div>
    </div>
  </div>

  <!-- 城堡互動確認 -->
  <div v-if="buildingStore.castleInteraction" class="castle-interaction-ui">
    <div class="castle-panel">
      <div class="castle-title">練功坊</div>
      <div class="castle-desc">確定進入練功坊嗎？</div>
      <div class="castle-actions">
        <button class="confirm-btn" @click="enterTrainingRoom">確認</button>
        <button class="cancel-btn" @click="cancelCastleInteraction">取消</button>
      </div>
    </div>
  </div>

  <!-- 連線模式 UI -->
  <div v-if="buildingStore.isConnecting" class="connection-ui">
    <div class="connection-info">
      <p>連線模式</p>
      <p v-if="buildingStore.connectionSource">
        起始建築: ({{ buildingStore.connectionSource.x }}, {{ buildingStore.connectionSource.y }})
      </p>
      <p style="color: #3b82f6;">請點擊地圖上的另一個建築完成連線</p>
    </div>
    <div class="connection-controls">
      <button @click="cancelConnection" class="cancel-btn">
        取消
      </button>
    </div>
  </div>

  <!-- 連線顯示切換按鈕 -->
  <div class="connection-toggle-ui">
    <button 
      class="toggle-btn" 
      @click="toggleConnections"
      :class="{ active: buildingStore.showConnections }"
    >
      {{ buildingStore.showConnections ? '隱藏連線' : '顯示連線' }}
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBuildingStore } from '@/stores/buildings';
import { Game } from '@/game/Game.js';

const emit = defineEmits(['game-ready']);

const pixiContainer = ref(null);
const buildingStore = useBuildingStore();
let gameInstance = null;
const router = useRouter();

onMounted(async () => {
  if (pixiContainer.value) {
    // 建立遊戲實例，它會自己處理所有事
    gameInstance = new Game(pixiContainer.value);
    await gameInstance.init();
    console.log('✅ PixiGameCanvas.vue: Game 引擎已啟動，並由 Game.js 自主管理');
    
    // 觸發遊戲準備完成事件
    emit('game-ready');
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

function connectBuilding() {
  const tgt = buildingStore.deleteTarget;
  if (!tgt) return;
  
  // 開始連線模式
  buildingStore.startConnection(tgt);
  // 關閉操作選單
  buildingStore.cancelDeletePrompt();
}

function enterTrainingRoom() {
  buildingStore.hideCastleInteraction();
  router.push('/questions');
}

function cancelCastleInteraction() {
  buildingStore.hideCastleInteraction();
}

function toggleConnections() {
  buildingStore.toggleConnections();
}

function cancelConnection() {
  buildingStore.cancelConnection();
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
  min-height: 100dvh;
}

.pixi-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.building-operation-ui {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
}

.operation-panel {
  background: #a9b39ef3;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  min-width: 300px;
}
.operation-panel .title {
  font-weight: 700;
  margin-bottom: 8px;
}
.operation-panel .desc {
  color: #4b5563;
  margin-bottom: 12px;
}
.operation-panel .actions { 
  display: flex; 
  gap: 10px; 
  flex-wrap: wrap;
}
.operation-panel .danger {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}
.operation-panel .danger:hover { background: #b91c1c; }
.operation-panel .connect {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}
.operation-panel .connect:hover { background: #2563eb; }
.operation-panel .ghost {
  background: #d3f1d7;
  color: #111827;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}
.operation-panel .ghost:hover { background: #e5e7eb; }

.placement-ui {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 150; 
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

.toast {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  padding: 16px 22px;
  border-radius: 12px;
  z-index: 300;
  max-width: 560px;
  font-size: 18px;
  line-height: 1.4; 
} 

.tile-developed {
  background:  #22c55e;
  border: 2px solid #16a34a;
  animation: slideDownWithCenter 0.3s ease-out;
}

.tile-developed .message-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tile-developed .message-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tile-developed .message-text {
  flex: 1;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

@keyframes slideDownOnly {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDownWithCenter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.castle-interaction-ui {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 400;
}

.castle-panel {
  background:rgba(255, 255, 255, 0.95);
  border: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 24px;
  min-width: 320px;
  text-align: center;
  animation: slideDownOnly 0.3s ease-out;
}

.castle-title {
  font-size: 24px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  margin-bottom: 12px;
} 

.castle-desc {
  font-size: 18px;
  color: rgb(0, 0, 0);
  margin-bottom: 20px;
  line-height: 1.4;
}

.castle-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.castle-actions .confirm-btn {
  background:  #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.castle-actions .confirm-btn:hover {
  background: #526ce1;
  transform: translateY(-2px);
}

.castle-actions .cancel-btn {
  background: #eab35c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.castle-actions .cancel-btn:hover {
  background: #daa249;
  transform: translateY(-2px);
}

.connection-toggle-ui {
  position: absolute;
  top: 140px;
  right: 40px;
  z-index: 100;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #3b82f6;
  color: #3b82f6;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.toggle-btn.active {
  background: #3b82f6;
  color: white;
}

.toggle-btn.active:hover {
  background: #2563eb;
}

.connection-ui {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(59, 130, 246, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 150; 
  min-width: 250px;
  pointer-events: auto;
}

.connection-info {
  margin-bottom: 10px;
}

.connection-info p {
  margin: 5px 0;
  color: white;
  font-size: 14px;
}

.connection-controls {
  display: flex;
  gap: 10px;
}

.connection-controls .cancel-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.connection-controls .cancel-btn:hover {
  background: #da190b;
}

</style>