<template>
  <div class="security-event-log-container">
    <div class="header">
      <h2 class="title">資安事件紀錄</h2>
      <div class="filter-tabs">
        <button 
          :class="['tab', { active: currentFilter === 'all' }]"
          @click="currentFilter = 'all'"
        >
          全部 ({{ eventLogStore.allEventsCount }})
        </button>
        <button 
          :class="['tab', { active: currentFilter === 'unresolved' }]"
          @click="currentFilter = 'unresolved'"
        >
          未處理 ({{ eventLogStore.unresolvedCount }})
        </button>
        <button 
          :class="['tab', { active: currentFilter === 'resolved' }]"
          @click="currentFilter = 'resolved'"
        >
          已解決 ({{ eventLogStore.resolvedEvents.length }})
        </button>
      </div>
    </div>
    
    <div v-if="eventLogStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>
    
    <div v-else-if="filteredEvents.length === 0" class="empty-state">
      <div class="empty-icon">📜</div>
      <p class="empty-text">
        {{ currentFilter === 'unresolved' ? '🎉 太棒了！目前沒有未處理的資安事件' : '目前沒有任何事件紀錄' }}
      </p>
    </div>
    
    <div v-else class="events-list-container">
      <div class="events-list">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id" 
          class="event-card"
          :class="{ 
            'resolved': event.resolved,
            'unresolved': !event.resolved,
            'selected': selectedEvent?.id === event.id
          }"
          @click="selectEvent(event)"
        >
          <div class="event-header">
            <div class="event-icon">
              {{ event.resolved ? '✅' : '⚠️' }}
            </div>
            <div class="event-title">
              <h3 class="event-name">{{ event.eventName }}</h3>
              <div class="event-meta">
                <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                <span 
                  class="event-status"
                  :class="{ 'status-resolved': event.resolved, 'status-unresolved': !event.resolved }"
                >
                  {{ event.resolved ? '已解決' : '未處理' }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="selectedEvent?.id === event.id" class="event-details">
            <p class="event-description">{{ event.description }}</p>
            <div class="event-info">
              <div class="info-item">
                <span class="info-label">發生時間：</span>
                <span class="info-value">{{ formatTime(event.timestamp) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">建議工具：</span>
                <span class="info-value">{{ getRequiredTools(event) }}</span>
              </div>
              <div v-if="event.resolved && event.resolvedAt" class="info-item">
                <span class="info-label">解決時間：</span>
                <span class="info-value">{{ formatTime(event.resolvedAt) }}</span>
              </div>
              <div v-if="event.resolved && event.resolvedBy" class="info-item">
                <span class="info-label">使用工具：</span>
                <span class="info-value">{{ getToolName(event.resolvedBy) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEventLogStore } from '@/stores/eventLogStore'
import { useInventoryStore } from '@/stores/inventory'

const eventLogStore = useEventLogStore()
const inventoryStore = useInventoryStore()

const currentFilter = ref('all')
const selectedEvent = ref(null)

// 根據當前篩選條件過濾事件
const filteredEvents = computed(() => {
  if (currentFilter.value === 'unresolved') {
    return eventLogStore.unresolvedEvents
  } else if (currentFilter.value === 'resolved') {
    return eventLogStore.resolvedEvents
  } else {
    return eventLogStore.allEvents
  }
})

// 選擇事件
function selectEvent(event) {
  if (selectedEvent.value?.id === event.id) {
    selectedEvent.value = null
  } else {
    selectedEvent.value = event
  }
}

// 格式化時間
function formatTime(timestamp) {
  if (!timestamp) return '未知時間'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取需要的工具名稱
function getRequiredTools(event) {
  if (!event.correctDefenses || event.correctDefenses.length === 0) {
    return '未知'
  }
  
  const toolNames = event.correctDefenses.map(toolId => {
    const tool = inventoryStore.items.find(item => item.id === toolId)
    return tool ? tool.name : toolId
  })
  
  return toolNames.join(', ')
}

// 獲取工具名稱
function getToolName(toolId) {
  const tool = inventoryStore.items.find(item => item.id === toolId)
  return tool ? tool.name : toolId
}

// 載入事件
onMounted(async () => {
  await eventLogStore.loadAllSecurityEvents()
})

// 監聽篩選變化，重新載入
watch(currentFilter, async () => {
  await eventLogStore.loadAllSecurityEvents()
})
</script>

<style scoped>
.security-event-log-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.header {
  margin-bottom: 20px;
}

.title {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tab {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  border-color: #3498db;
  color: #3498db;
}

.tab.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.empty-icon {
  font-size: 64px;
}

.empty-text {
  font-size: 18px;
  color: #7f8c8d;
  text-align: center;
}

.events-list-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-card.unresolved {
  border-left: 4px solid #e74c3c;
}

.event-card.resolved {
  border-left: 4px solid #27ae60;
  opacity: 0.8;
}

.event-card.selected {
  border-color: #3498db;
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.3);
}

.event-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.event-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.event-title {
  flex: 1;
  min-width: 0;
}

.event-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.event-time {
  color: #7f8c8d;
  font-size: 14px;
}

.event-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-resolved {
  background: #d4edda;
  color: #155724;
}

.status-unresolved {
  background: #f8d7da;
  color: #721c24;
}

.event-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.event-description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.info-value {
  color: #555;
}

/* 滾動條樣式 */
.events-list-container::-webkit-scrollbar {
  width: 8px;
}

.events-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.events-list-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.events-list-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
