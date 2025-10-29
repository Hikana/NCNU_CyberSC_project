<template>
  <div class="shop-container">
    <div class="shop-body">
      <div class="shop-categories">
        <button 
          v-for="t in categoryTypes" 
          :key="t.value" 
          class="category-btn" 
          :class="{ active: activeType === t.value }"
          @click="activeType = t.value">
          {{ t.label }}
        </button>
        
        <!-- 連線功能按鈕  連線控制UI (第14-42行) -->
        <div class="connection-controls">
          <button 
            class="connection-btn" 
            :class="{ active: buildingStore.isConnecting }"
            @click="toggleConnectionMode">
            {{ buildingStore.isConnecting ? '退出連線' : '連線模式' }}
          </button>
          <button 
            v-if="buildingStore.connections.length > 0"
            class="clear-connections-btn" 
            @click="clearAllConnections">
            清除連線
          </button>
          
          <!-- 連線規則說明 -->
          <div class="connection-rules" v-if="buildingStore.isConnecting">
            <h4>連線規則</h4>
            <div class="rule-item">
              <strong>貓屋 (Host):</strong> 只能連1個設備（一張網卡），可連貓屋/郵筒/郵局
            </div>
            <div class="rule-item">
              <strong>郵筒 (Switch):</strong> 最多連4個貓屋，可連郵筒和郵局
            </div>
            <div class="rule-item">
              <strong>郵局 (Router):</strong> 可連任何設備，Host限制1個，其他不限
            </div>
          </div>
        </div>
      </div>
      <div class="shop-list">
      <div class="shop-item" v-for="item in filteredItems" :key="item.id">
        <div class="item-image">
          <img :src="item.img" :alt="item.name" class="building-img" />
        </div>
        <div class="tech-cost">消耗科技點：{{ item.techCost }}</div>
        <button 
          class="buy-btn" 
          :class="{ disabled: !canAfford(item) }"
          @click="buy(item)"
          :disabled="!canAfford(item)"
        >
          <span v-if="!canAfford(item)">科技點不足</span>
          <span v-else>購買</span>
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBuildingStore } from '@/stores/buildings'
import { usePlayerStore } from '@/stores/player'
import { onMounted, computed, ref } from 'vue'

const buildingStore = useBuildingStore()
const playerStore = usePlayerStore()

// 類別資料及當前選擇（預設 host）
const categoryTypes = ref([
  { value: 'host', label: '主機' },
  { value: 'router', label: '路由器' },
  { value: 'switch', label: '交換器' },
])
const activeType = ref('host')

// 依類別過濾顯示
const filteredItems = computed(() => {
  const list = buildingStore.shopBuildings || []
  if (!activeType.value) return list
  return list.filter(i => (i.type || 'host') === activeType.value)
})

onMounted(() => {
  buildingStore.loadShop()
})

function canAfford(item) {
  return playerStore.techPoints >= item.techCost
}

function buy(item) {
  // 如果科技點不足，直接返回
  if (!canAfford(item)) {
    return
  }
  
  console.log('BuildingShop: 購買建築', item)
  // 使用 store 的購買方法
  if (buildingStore.buyBuilding(item)) {
    console.log('BuildingShop: 購買成功，放置模式設置完成', {
      isPlacing: buildingStore.isPlacing,
      selectedBuildingId: buildingStore.selectedBuildingId
    })
    
    // 通知父元件購買成功，可以關閉選單
    emit('purchaseSuccess')
  } else {
    // 購買失敗（科技點不足）
    console.log('BuildingShop: 購買失敗，科技點不足')
  }
}

//連線功能方法 (第118-132行)
function toggleConnectionMode() {
  if (buildingStore.isConnecting) {
    buildingStore.stopConnectionMode()
  } else {
    buildingStore.startConnectionMode()
  }
}

function clearAllConnections() {
  if (confirm('確定要清除所有連線嗎？')) {
    buildingStore.clearAllConnections()
  }
}

// 定義 emit 事件
const emit = defineEmits(['purchaseSuccess'])
</script>

<style scoped>

.shop-container {
  width: 100%;
  height: 100%;
  display: block; /* 內部排版交由父層控制滾動 */
}

.shop-body {
  display: grid;
  grid-template-columns: 80px 1fr; 
  gap: 10px;
  height: 100%;
  margin-left: -40px; 
}

.shop-categories {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 80px; /* 與左欄一致，避免多佔寬度 */
}

.category-btn {
  padding: 4px 5px;
  border-radius: 12px;
  border: 2px solid #3498db33;
  background: #ffffff;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}
.category-btn:hover { border-color: #3498db; box-shadow: 0 2px 8px rgba(52,152,219,0.25); }
.category-btn.active { background: #3498db; color: #fff; border-color: #2980b9; }

/* 連線控制按鈕樣式   連線規則CSS樣式 (第176-259行) */
.connection-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connection-btn {
  padding: 6px 8px;
  border-radius: 12px;
  border: 2px solid #e74c3c33;
  background: #ffffff;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.connection-btn:hover { 
  border-color: #e74c3c; 
  box-shadow: 0 2px 8px rgba(231,76,60,0.25); 
}

.connection-btn.active { 
  background: #e74c3c; 
  color: #fff; 
  border-color: #c0392b; 
}

.clear-connections-btn {
  padding: 4px 6px;
  border-radius: 8px;
  border: 2px solid #f39c1233;
  background: #ffffff;
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.8rem;
}

.clear-connections-btn:hover { 
  border-color: #f39c12; 
  box-shadow: 0 2px 8px rgba(243,156,18,0.25); 
}

/* 連線規則樣式 */
.connection-rules {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.connection-rules h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 600;
}

.rule-item {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
  line-height: 1.3;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-item strong {
  color: #495057;
}

.shop-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 固定三欄，維持九宮格 */
  gap: 16px; /* 稍微縮小間距，讓卡片更寬 */
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.shop-item {
  background: #fff;
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px #0001;
  justify-content: space-between;
  height: 220px;
  pointer-events: auto;
}

.item-image {
  border-radius: 16px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.building-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.buy-btn {
  background: #a5e887;
  color: #222;
  border: none;
  border-radius: 16px;
  padding: 8px 24px;
  font-size: 1.1rem;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  z-index: 100;
  min-height: 40px;
  width: 100%;
  font-weight: bold;
  pointer-events: auto;
}

.buy-btn:hover {
  background: #7fd36b;
}

.buy-btn:active {
  background: #6bc25a;
  transform: translateY(1px);
}

.buy-btn.disabled {
  background: #cccccc;
  color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}

.buy-btn.disabled:hover {
  background: #cccccc;
  transform: none;
}

.buy-btn.disabled:active {
  background: #cccccc;
  transform: none;
}

.tech-cost {
  margin: 8px 0 8px 0;
  font-size: 1rem;
  color: #226;
  font-weight: 500;
  pointer-events: auto;
}
</style>
