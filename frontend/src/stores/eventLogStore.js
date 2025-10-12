import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/apiService';

export const useEventLogStore = defineStore('eventLog', {
  state: () => ({
    // 未處理的資安事件列表
    unresolvedEvents: [],
    // 載入狀態
    loading: false,
    // 是否已完成初始化
    isLoaded: false,
  }),
  
  getters: {
    // 根據事件 ID 獲取事件
    getEventById: (state) => (eventId) => {
      return state.unresolvedEvents.find(event => event.id === eventId);
    },
    
    // 根據防禦工具 ID 獲取可用事件
    getEventsByTool: (state) => (toolId) => {
      return state.unresolvedEvents.filter(event => 
        event.correctDefenses && event.correctDefenses.includes(toolId)
      );
    },
    
    // 未處理事件總數
    unresolvedCount: (state) => state.unresolvedEvents.length,
  },
  
  actions: {
    // 載入資安事件
    async loadSecurityEvents() {
      const authStore = useAuthStore();
      if (!authStore.user?.uid) {
        console.warn('loadSecurityEvents: 缺少 userId');
        return;
      }
      
      this.loading = true;
      try {
        const events = await apiService.getSecurityEvents(authStore.user.uid);
        this.unresolvedEvents = events.filter(event => !event.resolved);
        this.isLoaded = true;
        console.log('📜 載入資安事件:', this.unresolvedEvents.length, '個未處理事件');
      } catch (error) {
        console.error('❌ 載入資安事件失敗:', error);
        this.unresolvedEvents = [];
      } finally {
        this.loading = false;
      }
    },
    
    // 新增資安事件
    async addSecurityEvent(eventData) {
      const authStore = useAuthStore();
      if (!authStore.user?.uid) {
        console.warn('addSecurityEvent: 缺少 userId');
        return;
      }
      
      try {
        console.log('📜 eventLogStore 準備新增資安事件:', eventData);
        const newEvent = await apiService.addSecurityEvent(authStore.user.uid, eventData);
        console.log('📜 eventLogStore 收到回應:', newEvent);
        
        // 確保 newEvent 有正確的資料結構
        if (newEvent && newEvent.id) {
          // 檢查是否已存在相同 ID 的事件，避免重複添加
          const existingEvent = this.unresolvedEvents.find(e => e.id === newEvent.id);
          if (!existingEvent) {
            this.unresolvedEvents.push(newEvent);
            console.log('📜 新增資安事件成功:', newEvent.eventName || newEvent.id);
            console.log('📜 當前未處理事件數量:', this.unresolvedEvents.length);
          } else {
            console.log('📜 事件已存在，跳過重複添加:', newEvent.id);
          }
        } else {
          console.warn('⚠️ 新增資安事件回應格式異常:', newEvent);
          console.warn('⚠️ 預期格式: { id, eventId, eventName, timestamp, description, correctDefenses, resolved }');
        }
        
        return newEvent;
      } catch (error) {
        console.error('❌ 新增資安事件失敗:', error);
        console.error('錯誤詳情:', error.message, error.stack);
        console.error('請求資料:', eventData);
        throw error;
      }
    },
    
    // 解決資安事件
    async resolveSecurityEvent(eventId, usedItemId) {
      const authStore = useAuthStore();
      if (!authStore.user?.uid) {
        console.warn('resolveSecurityEvent: 缺少 userId');
        return;
      }
      
      try {
        const result = await apiService.resolveSecurityEvent(authStore.user.uid, eventId, usedItemId);
        
        // 從本地列表中移除已解決的事件
        this.unresolvedEvents = this.unresolvedEvents.filter(event => event.id !== eventId);
        
        console.log('✅ 解決資安事件:', eventId, '使用工具:', usedItemId);
        return result;
      } catch (error) {
        console.error('❌ 解決資安事件失敗:', error);
        throw error;
      }
    },
    
    // 檢查是否有事件需要特定工具
    hasEventsForTool(toolId) {
      return this.getEventsByTool(toolId).length > 0;
    },
    
    // 獲取需要特定工具的事件列表
    getEventsNeedingTool(toolId) {
      return this.getEventsByTool(toolId);
    },
    
    // 清理狀態
    clearEvents() {
      this.unresolvedEvents = [];
      this.isLoaded = false;
    }
  }
});
