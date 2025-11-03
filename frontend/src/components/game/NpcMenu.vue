<template>
  <div class="npc-menu" v-if="uiStore.isNpcMenuOpen">
    <button class="close-btn" @click="uiStore.closeAllMenus()">×</button>
    <div class="menu-body">
      <div class="menu-left">
        <button  
          v-for="item in menuItems" 
          :key="item.id"
          :class="{ active: currentView === item.id }" 
          @click="currentView = item.id"
          class="menu-button"
          :title="item.name"
        >
          <span class="icon">{{ item.icon }}</span>
        </button>
      </div>

      <div class="menu-right">
      
        <!-- 背包頁面 -->
        <div v-if="currentView === 'inventory'" class="inventory-container">
          <h2 class="page-title">背包</h2>
          <div v-if="inv.loading">載入中...</div>
          <div v-else-if="inv.items.length === 0" class="empty-inventory">
            <p>背包是空的</p>
          </div>
          <div v-else class="inventory-content">
            <div class="inventory-list">
              <div v-for="item in inv.items" :key="item.id" 
                   class="inventory-item" 
                   :class="{ selected: selectedItem?.id === item.id }"
                   @click="selectItem(item)">
                <div class="item-icon">🛡️</div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-qty">x{{ item.qty }}</div>
                </div>
              </div>
            </div>
            
            <!-- 物品詳細資訊 -->
            <div v-if="selectedItem" class="item-detail">
              <h3>{{ selectedItem.name }}</h3>
              <p class="item-description">防禦工具 - {{ selectedItem.type }}</p>
              <div class="item-stats">
                <div class="stat">數量: x{{ selectedItem.qty }}</div>
                <div class="stat">類型: {{ selectedItem.type }}</div>
              </div>
              <div class="item-actions">
                <button class="use-btn" @click="useItem(selectedItem)">使用</button>
                <button class="close-btn" @click="selectedItem = null">x</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 建築商店畫面 -->
        <div v-if="currentView === 'shop'" class="shop-container">
          <h2 class="page-title">建築商店</h2>
          <div class="shop-content">
            <BuildingShop @purchaseSuccess="closeMenu" />
          </div>
        </div>
        <!-- 成就頁面 -->
        <div v-else-if="currentView === 'achievement'" class="achievement-container">
          <h2 class="page-title">成就</h2>
          <div class="achievement-content-wrap">
            <AchievementMenu 
              :isVisible="true" 
              @close="currentView = 'shop'" 
            />
          </div>
        </div>
        
        <!-- 說明頁面（動態載入） -->
        <div v-else-if="currentView === 'help'" class="help-container">
          <h2 class="page-title">遊戲規則說明</h2>
          <div class="help-content">
            <HelpPanel />
          </div>
        </div>
        
        <!-- 資安事件紀錄頁面 -->
        <div v-else-if="currentView === 'logs'" class="security-events-container">
          <h2 class="page-title">資安事件紀錄</h2>
          <div v-if="eventLogStore.loading">載入中...</div>
          <div v-else-if="eventLogStore.unresolvedEvents.length === 0" class="empty-events">
            <p>🎉 太棒了！目前沒有未處理的資安事件</p>
          </div>
          <div v-else class="events-content">
            <!-- 事件列表（未選擇事件時顯示） -->
            <div v-if="!selectedEvent" class="events-list">
              <div class="events-list-header">
                <h3>未處理事件</h3>
                <span class="event-count">{{ eventLogStore.unresolvedEvents.length }}</span>
              </div>
              <div class="events-list-scroll">
                <div v-for="event in eventLogStore.unresolvedEvents" :key="event.id" 
                     class="event-item" 
                     @click="selectEvent(event)">
                  <div class="event-icon">⚠️</div>
                  <div class="event-info">
                    <div class="event-name">{{ event.eventName }}</div>
                    <div class="event-time">{{ formatTime(event.timestamp) }}</div>
                  </div>
                  <div class="event-status">未處理</div>
                </div>
              </div>
            </div>
            
            <!-- 事件詳細資訊（選擇事件時顯示，佔滿整個畫面） -->
            <div v-else class="event-detail-container">
              <div class="event-detail-header">
                <button class="back-btn" @click="closeEventDetail" title="返回列表">
                  <span class="back-icon">←</span>
                  <span class="back-text">返回列表</span>
                </button>
                <h3>{{ selectedEvent.eventName }}</h3>
                <div style="width: 100px;"></div> <!-- 佔位，保持居中 -->
              </div>
              
              <div class="event-detail-body">
                <div class="event-description-section">
                  <h4>事件描述</h4>
                  <p class="event-description">{{ selectedEvent.description }}</p>
                </div>
                
                <div class="event-info-section">
                  <div class="info-item">
                    <span class="info-label">發生時間</span>
                    <span class="info-value">{{ formatTime(selectedEvent.timestamp) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">建議工具</span>
                    <span class="info-value tools-suggested">{{ getRequiredTools(selectedEvent) }}</span>
                  </div>
                </div>
                
                <div class="event-actions-section">
                  <button 
                    class="resolve-btn" 
                    @click="resolveEvent(selectedEvent)"
                    :class="{ 'active': showToolSelection && selectedEventForTool?.id === selectedEvent?.id }">
                    {{ showToolSelection && selectedEventForTool?.id === selectedEvent?.id ? '隱藏工具選擇' : '選擇工具處理' }}
                  </button>
                </div>
                
                <!-- 工具選擇區域（在同一個滾動區域內） -->
                <div 
                  v-if="showToolSelection && selectedEventForTool?.id === selectedEvent?.id" 
                  class="tool-selection-section">
                  <div class="tool-selection-header-inline">
                    <h4>🛡️ 選擇要使用的工具</h4>
                  </div>
                  <div v-if="inv.items.filter(item => item.qty > 0).length === 0" class="no-tools-message">
                    <p>您目前沒有可用的防禦工具</p>
                  </div>
                  <div v-else class="tools-grid-inline">
                    <div v-for="tool in inv.items.filter(item => item.qty > 0)" 
                         :key="tool.id"
                         class="tool-option-inline"
                         :class="{
                           'tool-correct': selectedEventForTool.correctDefenses.includes(tool.id),
                           'tool-incorrect': !selectedEventForTool.correctDefenses.includes(tool.id)
                         }"
                         @click="useToolForEvent(tool)">
                      <div class="tool-icon">🛡️</div>
                      <div class="tool-info">
                        <div class="tool-name">{{ tool.name }}</div>
                        <div class="tool-qty">數量: {{ tool.qty }}</div>
                      </div>
                      <div class="tool-status" 
                           :class="{ 
                             'correct': selectedEventForTool.correctDefenses.includes(tool.id),
                             'incorrect': !selectedEventForTool.correctDefenses.includes(tool.id)
                           }">
                        {{ selectedEventForTool.correctDefenses.includes(tool.id) ? '✓ 適用' : '✗ 不適用' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 答題紀錄頁面 -->
        <div v-else-if="currentView === 'records'" class="records-container"> 
          <h2 class="page-title">答題紀錄</h2>
          <div class="records-content">
            <HistoryPanel />
          </div>
        </div>

        

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue' 
import BuildingShop from '@/components/game/BuildingShop.vue'
import AchievementMenu from '@/components/game/AchievementMenu.vue'
import HistoryPanel from '@/components/game/HistoryPanel.vue'
import { useUiStore } from '@/stores/ui';
import { useInventoryStore } from '@/stores/inventory.js';
import { useAuthStore } from '@/stores/authStore';
import { useEventLogStore } from '@/stores/eventLogStore';
import { usePlayerStore } from '@/stores/player'


const player = usePlayerStore()
const inv = useInventoryStore()
const authStore = useAuthStore(); 
const eventLogStore = useEventLogStore();

// 動態載入說明頁面
const HelpPanel = defineAsyncComponent(() => import('@/components/game/HelpPanel.vue'))

// 選中的物品和事件
const selectedItem = ref(null)
const selectedEvent = ref(null)
const showToolSelection = ref(false)
const selectedEventForTool = ref(null)

// 點擊物品顯示詳細資訊
function selectItem(item) {
  selectedItem.value = item
  console.log('選中物品:', item)
}

// 點擊事件顯示詳細資訊
function selectEvent(event) {
  selectedEvent.value = event
  console.log('選中事件:', event)
}

// 處理事件 - 顯示工具選擇介面
function resolveEvent(event) {
  console.log('🛡️ 準備處理事件:', event.eventName)
  // 如果已經顯示同一個事件的工具選擇，則關閉；否則顯示
  if (showToolSelection.value && selectedEventForTool.value?.id === event.id) {
    showToolSelection.value = false
    selectedEventForTool.value = null
  } else {
    selectedEventForTool.value = event
    showToolSelection.value = true
  }
}

// 關閉事件詳細資訊
function closeEventDetail() {
  selectedEvent.value = null
  showToolSelection.value = false
  selectedEventForTool.value = null
}

// 選擇工具處理事件
async function useToolForEvent(tool) {
  try {
    if (!selectedEventForTool.value) {
      console.error('沒有選中的事件')
      return
    }
    
    console.log(`🛡️ 使用工具 ${tool.name} 處理事件:`, selectedEventForTool.value.eventName)
    
    // 檢查工具是否為正確的防禦
    const isCorrectTool = selectedEventForTool.value.correctDefenses.includes(tool.id)
    
    if (isCorrectTool) {
      // 使用工具處理事件
      await eventLogStore.resolveSecurityEvent(selectedEventForTool.value.id, tool.id)
      
      // 使用物品（會扣掉數量）
      await inventoryStore.useItem(tool.id)
      
      alert(`✅ 成功使用 ${tool.name} 處理了事件：${selectedEventForTool.value.eventName}！`)
      
      // 更新玩家防禦值
      const playerStore = usePlayerStore()
      await playerStore.refreshPlayerData()
      
      // 清除選中狀態
      selectedEvent.value = null
      showToolSelection.value = false
      selectedEventForTool.value = null
    } else {
      // 工具無效，但仍會消耗
      await inventoryStore.useItem(tool.id)
      alert(`❌ ${tool.name} 無法處理此事件，但工具已消耗！\n\n正確的工具應該是：${getRequiredTools(selectedEventForTool.value)}`)
    }
    
    // 關閉工具選擇介面
    showToolSelection.value = false
    selectedEventForTool.value = null
    
  } catch (error) {
    console.error('❌ 處理事件失敗:', error)
    alert(`處理事件失敗: ${error.message}`)
  }
}

// 取消工具選擇
function cancelToolSelection() {
  showToolSelection.value = false
  selectedEventForTool.value = null
}

// 格式化時間
function formatTime(timestamp) {
  if (!timestamp) return '未知時間'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-TW')
}

// 獲取需要的工具名稱
function getRequiredTools(event) {
  if (!event.correctDefenses || event.correctDefenses.length === 0) {
    return '未知'
  }
  
  // 從 inventory store 獲取工具名稱
  const toolNames = event.correctDefenses.map(toolId => {
    const tool = inv.items.find(item => item.id === toolId)
    return tool ? tool.name : toolId
  })
  
  return toolNames.join(', ')
}

// 使用物品
async function useItem(item) {
  try {
    console.log('🛡️ 嘗試使用物品:', item.name)
    
    // 檢查是否擁有該物品
    if (!item || item.qty <= 0) {
      alert(`你沒有 ${item.name} 這個物品`)
      return
    }
    
    // 檢查是否有需要該工具的未處理事件
    const eventsNeedingTool = eventLogStore.getEventsNeedingTool(item.id)
    
    if (eventsNeedingTool.length > 0) {
      // 如果有需要該工具的事件，讓玩家選擇要處理哪個事件
      const eventNames = eventsNeedingTool.map(e => e.eventName).join('\n')
      const shouldResolve = confirm(`這個工具可以處理以下事件：\n${eventNames}\n\n是否要使用 ${item.name} 來處理這些事件？`)
      
      if (shouldResolve) {
        // 處理所有需要該工具的事件
        for (const event of eventsNeedingTool) {
          await eventLogStore.resolveSecurityEvent(event.id, item.id)
        }
        
        // 使用物品（會扣掉數量）
        await inventoryStore.useItem(item.id)
        
        alert(`✅ 成功使用 ${item.name} 處理了 ${eventsNeedingTool.length} 個資安事件！`)
        
        // 更新玩家防禦值
        const playerStore = usePlayerStore()
        await playerStore.refreshPlayerData()
        
        // 清除選中狀態
        selectedItem.value = null
        return
      }
    }
    
    // 如果沒有需要該工具的事件，或玩家選擇不處理，則正常使用物品
    await inventoryStore.useItem(item.id)
    
    console.log(`✅ 成功使用物品 ${item.name}`)
    
    // 顯示使用結果
    alert(`成功使用 ${item.name}！`)
    
    // 更新玩家防禦值
    const playerStore = usePlayerStore()
    await playerStore.refreshPlayerData()
    
    // 清除選中狀態
    selectedItem.value = null
    
  } catch (error) {
    console.error('❌ 使用物品失敗:', error)
    alert(`使用物品失敗: ${error.message}`)
  }
}



const inventoryStore = useInventoryStore()

onMounted(async () => {
  // 初始化背包，即時監聽 Firestore
  const uid = authStore.user?.uid;

  console.log('🚀 初始化背包，玩家ID:', uid)
  await inventoryStore.init(uid)
  console.log('✅ 背包初始化完成，物品數量:', inventoryStore.items.length)
  
  // 載入資安事件
  console.log('🚀 載入資安事件，玩家ID:', uid)
  await eventLogStore.loadSecurityEvents()
  console.log('✅ 資安事件載入完成，未處理事件數量:', eventLogStore.unresolvedEvents.length)
})


const uiStore = useUiStore();

const menuItems = ref([
  { id: 'inventory', name: '背包', icon: '🎒' },
  { id: 'shop', name: '建築商店', icon: '🏪' },
  { id: 'logs', name: '資安事件紀錄', icon: '📜' },
  { id: 'records', name: '答題紀錄', icon: '📝' },
  { id: 'achievement', name: '成就', icon: '🏆' }, 
  { id: 'help', name: '說明', icon: '❓' },
]);

const currentView = ref('inventory');


// 監聽頁面切換，當切換到資安事件紀錄時重新載入
watch(currentView, async (newView) => {
  if (newView === 'logs') {
    console.log('🔄 切換到資安事件紀錄頁面，重新載入事件...');
    await eventLogStore.loadSecurityEvents();
    console.log('✅ 資安事件重新載入完成，未處理事件數量:', eventLogStore.unresolvedEvents.length);
  }
});

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])


// 在 script setup 中新增
function onUse(item) {
  // 1) 如果你想直接影響 RandomEventModal：你可以發一個全域事件或呼叫 event store
  // 這邊先簡單示範：直接用 inventoryStore.useItem()
  inventoryStore.useItem(item.key).then(() => {
    // 可加提示：例如 UI store 顯示 toastr（或 console）
    console.log('使用物品', item.key)
  })
}

function onDrop(item) {
  if (confirm(`確定丟棄 ${item.name} 嗎？`)) {
    inventoryStore.removeItem(item.key)
  }
}



function closeMenu() {
  emit('close')
}
</script>

<style scoped>
.npc-menu {
  position: absolute;
  bottom: 20px;
  left: 170px;
  width: calc(100% - 200px);
  max-width: 900px;
  height: 70vh;
  max-height: 550px;
  background-color: rgba(230, 240, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  z-index: 10;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  backdrop-filter: blur(5px);
  pointer-events: auto;
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: rgba(0,0,0,0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.close-btn:hover {
    background: rgba(0,0,0,0.4);
}
.menu-body {
  display: flex;
  height: 100%;
}
.menu-left {
  display: flex; 
  flex-direction: column;
  gap: 15px;
  padding-right: 20px;
  border-right: 2px solid rgba(0,0,0,0.1);
}
.menu-button {
  width: 60px;
  height: 60px;
  border: 3px solid transparent;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: #3498db;
}

.menu-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 商店容器樣式 */
.shop-container {
  width: 100%;
  height: 100%;
  pointer-events: auto;
  display: grid; /* 標題 + 內容 */
  grid-template-rows: auto 1fr; /* 標題固定，內容填滿可滾動 */
  padding: 0 20px 20px;
}

.shop-content {
  overflow-y: auto; /* 讓內容可滾動 */
  padding: 20px;
  min-height: 0; /* 關鍵：允許在 Grid/Flex 下正確計算剩餘高度 */
}

.achievement-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  padding: 0 20px 20px; 
}

/* 遊戲規則說明容器 */
.help-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  padding: 0 20px 20px;
}
.help-content {
  overflow-y: auto;
  padding: 20px;
}

.achievement-container .achievement-menu {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.achievement-container .achievement-content {
  width: 100%;
  height: auto;
  max-height: none;
  overflow: visible; /* 滾動交由外層 wrap 控制 */
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.menu-button.active {
  background-color: #3498db;
  border-color: #2980b9;
}
.menu-button .icon {
  font-size: 28px;
  transition: transform 0.2s;
}
.menu-button.active .icon {
    transform: scale(1.2);
}
.menu-right {
  flex-grow: 1;
  padding-left: 20px;
  overflow-y: hidden;
}
.menu-right h2 {
    margin-top: 0;
    color: #2c3e50;
}

/* 將標題統一成成就系統風格 */
.page-title {
  margin: 0px 0px 10px 0px;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
  align-self: flex-start;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
}
.cell {
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.cell-inner {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

.item-name {
  font-size: 10px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1.2;
  margin-bottom: 2px;
}

.item-desc {
  font-size: 8px;
  color: #7f8c8d;
  line-height: 1.1;
  margin-bottom: 2px;
}

.item-qty {
  font-size: 9px;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 4px;
}

.item-actions {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.item-actions .btn {
  padding: 2px 4px;
  font-size: 7px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-actions .btn:not(.ghost) {
  background-color: #3498db;
  color: white;
}

.item-actions .btn:not(.ghost):hover {
  background-color: #2980b9;
}

.item-actions .btn.ghost {
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.item-actions .btn.ghost:hover {
  background-color: #e74c3c;
  color: white;
}

/* 背包 */
.inventory-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0 20px 20px; 
  display: grid;
  grid-template-rows: auto 1fr; /* 標題固定，內容滾動 */
}

/* 答題紀錄 */
.records-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0 20px 20px;
  display: grid;
  grid-template-rows: auto 1fr; /* 標題固定，內容滾動 */
}
.records-content {
  overflow-y: auto;
  padding: 20px;
}

.inventory-container h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.empty-inventory {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 50px;
}

.inventory-content {
  display: flex;
  gap: 20px;
  height: auto;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

.inventory-list {
  flex: 1;
  overflow: visible;
  max-height: none;
}

.inventory-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.inventory-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.inventory-item.selected {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.item-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-detail {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(52, 152, 219, 0.3);
}

.item-detail h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
}

.item-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.item-stats {
  margin-bottom: 20px;
}

.stat {
  background: rgba(52, 152, 219, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.item-actions {
  display: flex;
  gap: 10px;
}

.use-btn, .close-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.use-btn {
  background: #27ae60;
  color: white;
}

.use-btn:hover {
  background: #229954;
}

.close-btn {
  background: #95a5a6;
  color: white;
}

.close-btn:hover {
  background: #7f8c8d;
}

.item-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 8px;
}

.item-desc {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.item-qty {
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}

.item-defense {
  color: #27ae60;
  font-weight: bold;
  font-size: 14px;
}

/* 資安事件頁面樣式 */
.security-events-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0 20px 20px; 
  display: grid;
  grid-template-rows: auto 1fr; /* 標題固定，內容滾動 */
}

.security-events-container h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.empty-events {
  text-align: center;
  color: #27ae60;
  font-style: italic;
  margin-top: 50px;
}

.events-content {
  height: 100%;
  min-height: 0;
  padding: 20px;
}

.events-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 15px;
  overflow: hidden;
}

.event-detail-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.events-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(231, 76, 60, 0.2);
}

.events-list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.event-count {
  background: #e74c3c;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.events-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.events-list-scroll::-webkit-scrollbar {
  width: 6px;
}

.events-list-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.events-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(231, 76, 60, 0.3);
  border-radius: 3px;
}

.events-list-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(231, 76, 60, 0.5);
}

.event-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  margin-right: 0; /* 移除右邊距，因為容器已經有足夠的內邊距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0; /* 防止 flex 項目超出容器 */
  max-width: 100%; /* 確保不會超出容器寬度 */
  overflow: visible; /* 改為 visible，讓狀態標籤可以顯示 */
  box-sizing: border-box; /* 確保邊框和內邊距包含在寬度內 */
}

.event-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #e74c3c;
}

.event-item.selected {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.event-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
}

.event-info {
  flex: 1;
  min-width: 0; /* 防止 flex 項目超出容器 */
  overflow: hidden; /* 防止文字溢出 */
}

.event-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 4px;
}

.event-time {
  color: #7f8c8d;
  font-size: 12px;
}

.event-status {
  color: #e74c3c;
  font-weight: bold;
  font-size: 12px;
  background: rgba(231, 76, 60, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e74c3c; /* 增加紅色邊框 */
  white-space: nowrap; /* 防止文字換行 */
  flex-shrink: 0; /* 防止標籤被壓縮 */
}


.event-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 2px solid rgba(231, 76, 60, 0.2);
  background: rgba(231, 76, 60, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(52, 152, 219, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #3498db;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(52, 152, 219, 0.1);
  border-color: #3498db;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 18px;
  font-weight: bold;
}

.back-text {
  font-size: 14px;
}

.event-detail-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.event-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.event-detail-body::-webkit-scrollbar {
  width: 8px;
}

.event-detail-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.event-detail-body::-webkit-scrollbar-thumb {
  background: rgba(231, 76, 60, 0.3);
  border-radius: 4px;
}

.event-detail-body::-webkit-scrollbar-thumb:hover {
  background: rgba(231, 76, 60, 0.5);
}

.event-description-section h4 {
  margin: 0 0 10px 0;
  color: #34495e;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.info-value {
  color: #34495e;
  font-size: 14px;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.info-value.tools-suggested {
  color: #27ae60;
  font-weight: 500;
}

.event-actions-section {
  margin-top: 10px;
}

.no-selection-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #95a5a6;
  font-size: 16px;
  font-style: italic;
}

.event-description {
  color: #555;
  line-height: 1.8;
  margin: 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.resolve-btn {
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(231, 76, 60, 0.3);
}

.resolve-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(231, 76, 60, 0.4);
}

.resolve-btn.active {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  box-shadow: 0 4px 6px rgba(149, 165, 166, 0.3);
}

/* 工具選擇區域樣式（內聯顯示） */
.tool-selection-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(52, 152, 219, 0.2);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tool-selection-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.tool-selection-header-inline h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.close-btn-small {
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.close-btn-small:hover {
  background: #7f8c8d;
}

.tools-grid-inline {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 8px;
}

.tool-option-inline {
  display: flex;
  align-items: center;
  padding: 14px;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-height: 70px;
}

.tool-option-inline:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.tool-option-inline.tool-correct {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.05);
}

.tool-option-inline.tool-correct:hover {
  border-color: #229954;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.tool-option-inline.tool-incorrect {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

.tool-option-inline.tool-incorrect:hover {
  border-color: #c0392b;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.tool-option-inline .tool-icon {
  font-size: 24px;
  margin-right: 12px;
}

.tool-option-inline .tool-info {
  flex: 1;
}

.tool-option-inline .tool-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 14px;
}

.tool-option-inline .tool-qty {
  color: #e74c3c;
  font-size: 12px;
}

.tool-option-inline .tool-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  min-width: 60px;
  white-space: nowrap;
}

.no-tools-message {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}

/* 工具選擇彈出視窗樣式（已不使用，但保留以防需要） */
.tool-selection-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.tool-selection-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.tool-selection-container {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  height: 70vh;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tool-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
}

.tool-selection-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.tool-selection-header .close-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-selection-header .close-btn:hover {
  background: #c0392b;
}

.event-info {
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.event-info h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 18px;
}

.event-info p {
  margin: 0 0 12px 0;
  color: #555;
  line-height: 1.5;
}

.suggested-tools {
  background: #e8f4fd;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  color: #2c3e50;
}

.tool-selection-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.tool-selection-content h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.tool-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-height: 60px;
}

.tool-option:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.tool-icon {
  font-size: 24px;
  margin-right: 16px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.tool-qty {
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: 2px;
}

.tool-defense {
  color: #27ae60;
  font-size: 14px;
}

.tool-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  min-width: 80px;
}

.tool-status.correct {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.tool-status.incorrect {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.tool-selection-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.achievement-content-wrap {
  overflow: visible; 
  padding: 0;
  min-height: 0;
}
</style>