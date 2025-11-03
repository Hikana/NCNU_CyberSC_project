<template>
  <!-- 主遊戲畫布（地圖和建築物） -->
  <div 
    ref="pixiContainer" 
    class="pixi-canvas"
  ></div>
  
  <!-- 獨立的連線畫布層 -->
  <div 
    ref="connectionCanvas" 
    class="connection-canvas"
  ></div>
  
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
        <button class="disconnect" @click="deleteConnection">刪除連線</button>
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

  <!-- 刪除連線模式 UI -->
  <div v-if="buildingStore.isDeletingConnection" class="delete-connection-ui">
    <div class="delete-connection-info">
      <p style="font-weight: bold;">刪除連線模式</p>
      <p v-if="buildingStore.deleteConnectionTarget">
        目標建築: ({{ buildingStore.deleteConnectionTarget.x }}, {{ buildingStore.deleteConnectionTarget.y }})
      </p>
      <p v-if="buildingStore.connectionsToDelete.length > 0" style="color: #dc2626;">
        共 {{ buildingStore.connectionsToDelete.length }} 條連線
      </p>
      <p v-else style="color: #16a34a;">
        此建築沒有任何連線
      </p>
    </div>
    <div class="connection-list" v-if="buildingStore.connectionsToDelete.length > 0">
      <div 
        v-for="conn in buildingStore.connectionsToDelete" 
        :key="conn.id"
        class="connection-item"
      >
        <span>{{ getConnectionDisplayText(conn, buildingStore.deleteConnectionTarget) }}</span>
        <button @click="deleteSingleConnection(conn.id)" class="delete-connection-btn">
          刪除
        </button>
      </div>
    </div>
    <div class="delete-connection-controls">
      <button @click="cancelDeleteConnection" class="cancel-btn">
        完成
      </button>
    </div>
  </div>

  <!-- 連線顯示切換按鈕 -->
  <div class="connection-toggle-ui">
    <button 
      class="toggle-btn" 
      @click="handleToggleConnections"
      @keydown.enter.stop
      :class="{ active: buildingStore.showConnections }"
      type="button"
      tabindex="-1"
    >
      {{ buildingStore.showConnections ? '隱藏連線' : '顯示連線' }}
    </button>
  </div>

  <!-- 連線顯示時的蒙版 -->
  <div 
    v-if="buildingStore.showConnections" 
    class="connection-overlay"
  >
    <!-- 蒙版内容为空，只是作为遮罩层，不响应点击事件 -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBuildingStore } from '@/stores/buildings';
import { Game } from '@/game/Game.js';

const emit = defineEmits(['game-ready']);

const pixiContainer = ref(null);
const connectionCanvas = ref(null);
const buildingStore = useBuildingStore();
let gameInstance = null;
const router = useRouter();

onMounted(async () => {
  if (pixiContainer.value) {
    // 建立遊戲實例，傳遞連線容器
    gameInstance = new Game(pixiContainer.value, connectionCanvas.value);
    await gameInstance.init();
    console.log('✅ PixiGameCanvas.vue: Game 引擎已啟動，並由 Game.js 自主管理');
    
    // 觸發遊戲準備完成事件
    emit('game-ready');
  }
  
  // 監聽連線顯示狀態，控制連線畫布的顯示
  watch(() => buildingStore.showConnections, (show) => {
    if (connectionCanvas.value) {
      if (show) {
        connectionCanvas.value.classList.add('show');
      } else {
        connectionCanvas.value.classList.remove('show');
      }
    }
  });
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

function deleteConnection() {
  const tgt = buildingStore.deleteTarget;
  if (!tgt) return;
  
  // 開始刪除連線模式
  buildingStore.startDeleteConnectionMode(tgt);
  // 關閉操作選單
  buildingStore.cancelDeletePrompt();
}

function cancelDeleteConnection() {
  buildingStore.cancelDeleteConnectionMode();
}

async function deleteSingleConnection(connectionId) {
  await buildingStore.deleteSingleConnection(connectionId);
}

function getConnectionDisplayText(conn, targetPosition) {
  if (!targetPosition) return '連線';
  
  // 判斷目標建築是連線的起點還是終點
  if (conn.from.x === targetPosition.x && conn.from.y === targetPosition.y) {
    // 目標建築是起點，顯示終點
    return `連線至: (${conn.to.x}, ${conn.to.y})`;
  } else {
    // 目標建築是終點，顯示起點
    return `連線自: (${conn.from.x}, ${conn.from.y})`;
  }
}

function cancelDelete() {
  buildingStore.cancelDeletePrompt();
}

function enterTrainingRoom() {
  buildingStore.hideCastleInteraction();
  router.push('/questions');
}

function cancelCastleInteraction() {
  buildingStore.hideCastleInteraction();
}

// 切換連線顯示（只允許滑鼠點擊，不允許鍵盤觸發）
function handleToggleConnections(event) {
  // 如果是鍵盤觸發的（Enter 或 Space），則阻止
  if (event.detail === 0 || event.type === 'keydown') {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  toggleConnections()
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
  z-index: 0; /* 地圖和建築物在蒙版下方 */
  min-width: 100vw;
  min-height: 100dvh;
}

/* 獨立的連線畫布層 */
.connection-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 55; /* 在蒙版（z-index: 50）上方，但在菜單（z-index: 300）下方 */
  pointer-events: none; /* 不攔截滑鼠事件 */
  visibility: hidden; /* 默認隱藏，只在需要時顯示 */
}

/* 當顯示連線時，顯示連線畫布 */
.connection-canvas.show {
  visibility: visible;
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
  min-width: 400px;
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
  display: grid; 
  grid-template-columns: 1fr 1fr;
  gap: 10px; 
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
.operation-panel .disconnect {
  background: #ff6b35;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}
.operation-panel .disconnect:hover { background: #e55a2b; }
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

.delete-connection-ui {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(220, 38, 38, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 150; 
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
}

.delete-connection-info {
  margin-bottom: 10px;
}

.delete-connection-info p {
  margin: 5px 0;
  color: white;
  font-size: 14px;
}

.connection-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.connection-item span {
  color: white;
  font-size: 13px;
  flex: 1;
}

.delete-connection-btn {
  background: #fff;
  color: #dc2626;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.delete-connection-btn:hover {
  background: #fca5a5;
  transform: translateY(-1px);
}

.delete-connection-controls {
  display: flex;
  gap: 10px;
}

.delete-connection-controls .cancel-btn {
  background: #fff;
  color: #dc2626;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.delete-connection-controls .cancel-btn:hover {
  background: #fca5a5;
}

/* 連線顯示時的蒙版 */
.connection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
  backdrop-filter: blur(0.5px); /* 減少模糊效果 */
  z-index: 50; /* 在遊戲畫面上方，但在連線和UI元素下方 */
  pointer-events: none; /* 不攔截滑鼠事件，允許點擊後面的元素 */
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 蒙版已經設置為 z-index: 50，其他UI元素的 z-index 都高於此值，所以會正常顯示在蒙版上方 */

</style>