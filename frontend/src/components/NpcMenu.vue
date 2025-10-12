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
          <h2>背包</h2>
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
                <div class="item-defense">防禦值: {{ item.defenseValue }}</div>
              </div>
            </div>
            
            <!-- 物品詳細資訊 -->
            <div v-if="selectedItem" class="item-detail">
              <h3>{{ selectedItem.name }}</h3>
              <p class="item-description">防禦工具 - {{ selectedItem.type }}</p>
              <div class="item-stats">
                <div class="stat">數量: x{{ selectedItem.qty }}</div>
                <div class="stat">防禦值: {{ selectedItem.defenseValue }}</div>
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
          <BuildingShop @purchaseSuccess="closeMenu" />
        </div>
        <!-- 成就頁面 -->
        <div v-else-if="currentView === 'achievement'" class="achievement-container">
          <AchievementMenu 
            :isVisible="true" 
            @close="currentView = 'shop'" 
          />
        </div>
        
        <!-- 資安事件紀錄頁面 -->
        <div v-else-if="currentView === 'logs'" class="security-events-container">
          <h2>資安事件紀錄</h2>
          <div v-if="eventLogStore.loading">載入中...</div>
          <div v-else-if="eventLogStore.unresolvedEvents.length === 0" class="empty-events">
            <p>🎉 太棒了！目前沒有未處理的資安事件</p>
          </div>
          <div v-else class="events-content">
            <div class="events-list">
              <div v-for="event in eventLogStore.unresolvedEvents" :key="event.id" 
                   class="event-item" 
                   :class="{ selected: selectedEvent?.id === event.id }"
                   @click="selectEvent(event)">
                <div class="event-icon">⚠️</div>
                <div class="event-info">
                  <div class="event-name">{{ event.eventName }}</div>
                  <div class="event-time">{{ formatTime(event.timestamp) }}</div>
                </div>
                <div class="event-status">未處理</div>
              </div>
            </div>
            
            <!-- 事件詳細資訊 -->
            <div v-if="selectedEvent" class="event-detail">
              <h3>{{ selectedEvent.eventName }}</h3>
              <p class="event-description">{{ selectedEvent.description }}</p>
              <div class="event-stats">
                <div class="stat">發生時間: {{ formatTime(selectedEvent.timestamp) }}</div>
                <div class="stat">需要工具: {{ getRequiredTools(selectedEvent) }}</div>
              </div>
              <div class="event-actions">
                <button class="resolve-btn" @click="resolveEvent(selectedEvent)">處理事件</button>
                <button class="close-btn" @click="selectedEvent = null">x</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 答題紀錄頁面 -->
        <div v-else-if="currentView === 'records'"> 
          <HistoryPanel />
        </div>

        <!-- 其他功能頁面 -->
        <div v-else-if="currentView !== 'inventory'">
          <h2>{{ menuItems.find(i => i.id === currentView)?.name }}</h2>
          <p>此功能開發中...</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue' 
import BuildingShop from '@/components/BuildingShop.vue'
import AchievementMenu from '@/components/AchievementMenu.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import { useUiStore } from '@/stores/ui';
import { useInventoryStore } from '@/stores/inventory.js';
import { useAuthStore } from '@/stores/authStore';
import { useEventLogStore } from '@/stores/eventLogStore';
import { usePlayerStore } from '@/stores/player'


const player = usePlayerStore()
const inv = useInventoryStore()
const authStore = useAuthStore(); 
const eventLogStore = useEventLogStore();

// 選中的物品和事件
const selectedItem = ref(null)
const selectedEvent = ref(null)

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

// 處理事件
async function resolveEvent(event) {
  try {
    console.log('🛡️ 嘗試處理事件:', event.eventName)
    
    // 檢查是否有需要的工具
    const requiredTools = event.correctDefenses || []
    const availableTools = inv.items.filter(item => 
      requiredTools.includes(item.id) && item.qty > 0
    )
    
    if (availableTools.length === 0) {
      alert(`處理此事件需要以下工具：\n${requiredTools.join(', ')}\n\n請先取得這些工具！`)
      return
    }
    
    // 如果有多個可用工具，讓玩家選擇
    let selectedTool
    if (availableTools.length === 1) {
      selectedTool = availableTools[0]
    } else {
      const toolNames = availableTools.map(t => t.name).join('\n')
      const choice = prompt(`有多個工具可以處理此事件：\n${toolNames}\n\n請輸入要使用的工具名稱：`)
      selectedTool = availableTools.find(t => t.name === choice)
      
      if (!selectedTool) {
        alert('無效的工具選擇！')
        return
      }
    }
    
    // 使用工具處理事件
    await eventLogStore.resolveSecurityEvent(event.id, selectedTool.id)
    
    // 使用物品（會扣掉數量）
    await inventoryStore.useItem(selectedTool.id)
    
    alert(`✅ 成功使用 ${selectedTool.name} 處理了事件：${event.eventName}！`)
    
    // 更新玩家防禦值
    const playerStore = usePlayerStore()
    await playerStore.refreshPlayerData()
    
    // 清除選中狀態
    selectedEvent.value = null
    
  } catch (error) {
    console.error('❌ 處理事件失敗:', error)
    alert(`處理事件失敗: ${error.message}`)
  }
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
    alert(`成功使用 ${item.name}！\n防禦值 +${item.defenseValue}`)
    
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
}

.achievement-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}

.achievement-container .achievement-menu {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.achievement-container .achievement-content {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
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
  overflow-y: auto;
}
.menu-right h2 {
    margin-top: 0;
    color: #2c3e50;
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

/* 背包面板樣式 */
.inventory-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.inventory-container h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
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
  height: 100%;
}

.inventory-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
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
  overflow-y: auto;
  padding: 20px;
}

.security-events-container h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
}

.empty-events {
  text-align: center;
  color: #27ae60;
  font-style: italic;
  margin-top: 50px;
}

.events-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.events-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.event-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.event-detail {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
}

.event-detail h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
}

.event-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.event-stats {
  margin-bottom: 20px;
}

.event-stats .stat {
  background: rgba(231, 76, 60, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.event-actions {
  display: flex;
  gap: 10px;
}

.resolve-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  background: #e74c3c;
  color: white;
}

.resolve-btn:hover {
  background: #c0392b;
}
</style>