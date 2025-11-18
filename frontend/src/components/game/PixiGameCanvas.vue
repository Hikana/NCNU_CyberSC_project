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
      <p>{{ buildingStore.isPlacingFirewall() ? '選擇建築架設防火牆' : '選擇位置放置建築' }}</p>
      <p v-if="buildingStore.selectedTile">
        選擇位置: ({{ buildingStore.selectedTile.x }}, {{ buildingStore.selectedTile.y }})
      </p>
      <p style="color: orange;">
        {{ buildingStore.isPlacingFirewall() ? '請點擊目標建築' : '請點擊地圖上的可建造土地' }}
      </p>
    </div>
    <div class="placement-controls">
      <button 
        v-if="buildingStore.selectedTile" 
        @click="confirmPlacement"
        class="confirm-btn"
      >
        {{ buildingStore.isPlacingFirewall() ? '確認架設' : '確認建造' }}
      </button>
      <button @click="cancelPlacement" class="cancel-btn">
        取消
      </button>
    </div>
  </div>

  <!-- 建築操作選擇 UI -->
  <div v-if="buildingStore.deleteTarget" class="building-operation-ui" @click="cancelDelete">
    <div class="operation-panel" @click.stop>
      <div class="operation-header">
        <span class="material-symbols-outlined op-icon">apartment</span>
        <div class="op-texts">
          <div class="title">建築操作</div>
          <div class="desc">位置 ({{ buildingStore.deleteTarget.x }}, {{ buildingStore.deleteTarget.y }})</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn connect" @click="connectBuilding">
          <span class="material-symbols-outlined">hub</span>
          <span>連線</span>
        </button>
        <button class="btn disconnect" @click="deleteConnection">
          <span class="material-symbols-outlined">link_off</span>
          <span>刪除連線</span>
        </button>
        <button class="btn danger" @click="confirmDelete">
          <span class="material-symbols-outlined">delete</span>
          <span>拆除</span>
        </button>
        <button class="btn ghost" @click="cancelDelete">
          <span class="material-symbols-outlined">close</span>
          <span>取消</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 放置限制訊息（取代 alert） -->
  <div v-if="buildingStore.placementMessage" class="toast tile-developed">
    <div class="message-content">
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
  <div v-if="buildingStore.castleInteraction" class="castle-interaction-ui" @click="cancelCastleInteraction">
    <div class="castle-panel" @click.stop>
      <div class="castle-header">
        <span class="material-symbols-outlined op-icon">fitness_center</span>
        <div class="op-texts">
          <div class="title">練功坊</div>
          <div class="desc">確定進入練功坊嗎？</div>
        </div>
      </div>
      <div class="castle-actions">
        <button class="btn connect" @click="enterTrainingRoom">
          <span class="material-symbols-outlined">play_arrow</span>
          <span>確認</span>
        </button>
        <button class="btn ghost" @click="cancelCastleInteraction">
          <span class="material-symbols-outlined">close</span>
          <span>取消</span>
        </button>
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
      <p class="connection-hint">點擊連線可在地圖上顯示該連線位置</p>
      <div 
        v-for="conn in buildingStore.connectionsToDelete" 
        :key="conn.id"
        class="connection-item"
        :class="{ selected: buildingStore.selectedConnectionId === conn.id }"
        @click="focusConnection(conn)"
      >
        <span>{{ getConnectionDisplayText(conn, buildingStore.deleteConnectionTarget) }}</span>
        <div class="connection-item-actions">
          <button 
            class="preview-connection-btn" 
            @click.stop="focusConnection(conn)"
          >
            顯示
          </button>
          <button @click.stop="deleteSingleConnection(conn.id)" class="delete-connection-btn">
            刪除
          </button>
        </div>
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
      {{ buildingStore.showConnections ? '隱藏連線、防火牆' : '顯示連線、防火牆' }}
    </button>
  </div>

  <!-- 連線顯示時的蒙版 -->
  <div 
    v-if="buildingStore.showConnections" 
    class="connection-overlay"
  >
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

function focusConnection(conn) {
  buildingStore.focusConnection(conn);
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
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  background:
    radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 10, 20, 0.75) 100%);
  backdrop-filter: blur(2px);
}

.operation-panel {
  position: relative;
  background: linear-gradient(135deg, rgba(8, 20, 36, 0.95) 0%, rgba(10, 32, 56, 0.92) 50%, rgba(8, 18, 32, 0.96) 100%);
  border-radius: 16px;
  border: 2px solid rgba(0, 255, 255, 0.25);
  padding: 20px;
  min-width: 460px;
  box-shadow:
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.06);
}

.operation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  margin-bottom: 14px;
}
.operation-header .op-icon {
  font-size: 28px;
  color: #22d3ee;
  filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.6));
}
.operation-header .title {
  font-size: 18px;
  font-weight: 800;
  color: #e6fbff;
  letter-spacing: 1px;
}
.operation-header .desc {
  color: #9bd8ff;
  font-size: 13px;
}
.operation-header .op-texts { display: flex; flex-direction: column; gap: 2px; }

.operation-panel .actions { 
  display: grid; 
  grid-template-columns: 1fr 1fr;
  gap: 12px; 
}
.operation-panel .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
}
.operation-panel .btn .material-symbols-outlined {
  font-size: 20px;
  line-height: 1;
}
.operation-panel .connect {
  background: linear-gradient(135deg, rgba(34,197,94,.95), rgba(16,185,129,.85));
  border-color: rgba(16,185,129,.6);
  box-shadow: 0 6px 18px rgba(16,185,129,.25);
}
.operation-panel .connect:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 10px 24px rgba(16,185,129,.35);
}
.operation-panel .disconnect {
  background: linear-gradient(135deg, rgba(59,130,246,.95), rgba(37,99,235,.85));
  border-color: rgba(37,99,235,.6);
  box-shadow: 0 6px 18px rgba(37,99,235,.25);
}
.operation-panel .disconnect:hover { 
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(37,99,235,.35);
}
.operation-panel .danger {
  background: linear-gradient(135deg, rgba(239,68,68,.95), rgba(220,38,38,.9));
  border-color: rgba(239,68,68,.6);
  box-shadow: 0 6px 18px rgba(239,68,68,.25);
}
.operation-panel .danger:hover { 
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(239,68,68,.35);
}
.operation-panel .ghost {
  background: linear-gradient(135deg, rgba(148,163,184,.3), rgba(148,163,184,.15));
  color: #e2e8f0;
  border-color: rgba(148,163,184,.35);
}
.operation-panel .ghost:hover { 
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(148,163,184,.45), rgba(148,163,184,.25));
}

.placement-ui {
  position: fixed;
  top: 120px;
  left: 28px;
  background: linear-gradient(135deg, rgba(12, 26, 46, 0.96), rgba(20, 54, 92, 0.92));
  padding: 16px;
  border-radius: 14px;
  border: 2px solid rgba(59, 130, 246, 0.45);
  box-shadow:
    0 8px 24px rgba(59, 130, 246, 0.25),
    inset 0 0 14px rgba(59, 130, 246, 0.15);
  z-index: 160; 
  min-width: 280px;
  pointer-events: auto;
}

.placement-info {
  margin-bottom: 10px;
}

.placement-info p {
  margin: 6px 0;
  color: #cfe7ff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .2px;
}

.placement-controls {
  display: flex;
  gap: 10px;
}

.confirm-btn {
  background: linear-gradient(135deg, rgba(34,197,94,.95), rgba(16,185,129,.85));
  color: #fff;
  border: 1px solid rgba(16,185,129,.6);
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(16,185,129,.25);
  transition: transform .15s ease, box-shadow .2s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(16,185,129,.35);
}

.cancel-btn {
  background: linear-gradient(135deg, rgba(148,163,184,.3), rgba(148,163,184,.15));
  color: #e2e8f0;
  border: 1px solid rgba(148,163,184,.35);
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(148,163,184,.45), rgba(148,163,184,.25));
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
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  background:
    radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
    linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 10, 20, 0.75) 100%);
  backdrop-filter: blur(2px);
}

.castle-panel {
  position: relative;
  background: linear-gradient(135deg, rgba(8, 20, 36, 0.95) 0%, rgba(10, 32, 56, 0.92) 50%, rgba(8, 18, 32, 0.96) 100%);
  border-radius: 16px;
  border: 2px solid rgba(0, 255, 255, 0.25);
  padding: 20px;
  min-width: 420px;
  box-shadow:
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.06);
}

.castle-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  margin-bottom: 14px;
}
.castle-header .op-icon {
  font-size: 28px;
  color: #22d3ee;
  filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.6));
}
.castle-header .title {
  font-size: 18px;
  font-weight: 800;
  color: #e6fbff;
  letter-spacing: 1px;
}
.castle-header .desc {
  color: #9bd8ff;
  font-size: 13px;
}
.castle-header .op-texts { display: flex; flex-direction: column; gap: 2px; }

.castle-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.castle-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
}
.castle-actions .btn .material-symbols-outlined {
  font-size: 20px;
  line-height: 1;
}
.castle-actions .connect {
  background: linear-gradient(135deg, rgba(34,197,94,.95), rgba(16,185,129,.85));
  border-color: rgba(16,185,129,.6);
  box-shadow: 0 6px 18px rgba(16,185,129,.25);
}
.castle-actions .connect:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 10px 24px rgba(16,185,129,.35);
}
.castle-actions .ghost {
  background: linear-gradient(135deg, rgba(148,163,184,.3), rgba(148,163,184,.15));
  color: #e2e8f0;
  border-color: rgba(148,163,184,.35);
}
.castle-actions .ghost:hover { 
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(148,163,184,.45), rgba(148,163,184,.25));
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
  position: fixed;
  top: 120px;
  left: 28px;
  background: linear-gradient(135deg, rgba(12, 26, 46, 0.96), rgba(20, 54, 92, 0.92));
  padding: 16px;
  border-radius: 14px;
  border: 2px solid rgba(59, 130, 246, 0.45);
  box-shadow:
    0 8px 24px rgba(59, 130, 246, 0.25),
    inset 0 0 14px rgba(59, 130, 246, 0.15);
  z-index: 160; 
  min-width: 280px;
  pointer-events: auto;
}

.connection-info {
  margin-bottom: 10px;
}

.connection-info p {
  margin: 6px 0;
  color: #cfe7ff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .2px;
}

.connection-controls {
  display: flex;
  gap: 10px;
}

.connection-controls .cancel-btn {
  background: linear-gradient(135deg, rgba(239,68,68,.95), rgba(220,38,38,.9));
  color: #fff;
  border: 1px solid rgba(239,68,68,.6);
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(239,68,68,.25);
  transition: transform .15s ease, box-shadow .2s ease;
}

.connection-controls .cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(239,68,68,.35);
}

.delete-connection-ui {
  position: fixed;
  top: 120px;
  left: 28px;
  background: linear-gradient(135deg, rgba(12, 26, 46, 0.96), rgba(20, 54, 92, 0.92));
  padding: 16px;
  border-radius: 14px;
  border: 2px solid rgba(59, 130, 246, 0.45);
  box-shadow:
    0 8px 24px rgba(59, 130, 246, 0.25),
    inset 0 0 14px rgba(59, 130, 246, 0.15);
  z-index: 160; 
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
}

.delete-connection-info {
  margin-bottom: 10px;
}

.delete-connection-info p {
  margin: 6px 0;
  color: #cfe7ff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .2px;
}

.connection-list {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 10px;
}

.connection-hint {
  margin: 0 0 8px;
  color: #8ec5ff;
  font-size: 14px;
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.06));
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  border: 1px solid rgba(255,255,255,.2);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.connection-item.selected {
  border-color: rgba(34,197,94,.8);
  box-shadow: 0 0 12px rgba(34,197,94,0.35);
}

.connection-item span {
  color: white;
  font-size: 15px;
  flex: 1;
}

.connection-item-actions {
  display: flex;
  gap: 6px;
  margin-left: 10px;
  width: 150px;
}

.preview-connection-btn {
  background: linear-gradient(135deg, rgba(59,130,246,.95), rgba(37,99,235,.85));
  color: #fff;
  border: 1px solid rgba(59,130,246,.6);
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(59,130,246,.25);
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
}

.preview-connection-btn:hover {
  box-shadow: 0 10px 24px rgba(59,130,246,.35);
}

.connection-item-actions .preview-connection-btn,
.connection-item-actions .delete-connection-btn {
  flex: 1;
  min-width: 0;
}

.delete-connection-btn {
  background: linear-gradient(135deg, rgba(239,68,68,.95), rgba(220,38,38,.9));
  color: #fff;
  border: 1px solid rgba(239,68,68,.6);
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 6px 18px rgba(239,68,68,.25);
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
}

.delete-connection-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(239,68,68,.35);
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
  font-size: 16px;
  font-weight: bold;
}


/* 連線顯示時的蒙版 */
.connection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.35) 100%);
  backdrop-filter: blur(0.5px); 
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

</style>