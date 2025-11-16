import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/apiService';
import { usePlayerStore } from '@/stores/player';

export const useEventLogStore = defineStore('eventLog', {
  state: () => ({
    // 未處理的資安事件列表
    unresolvedEvents: [],
    // 所有資安事件列表（包括已解決的）
    allEvents: [],
    // 載入狀態
    loading: false,
    // 是否已完成初始化
    isLoaded: false,
    // 持續懲罰計時器
    penaltyInterval: null,
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
    
    // 已解決事件列表
    resolvedEvents: (state) => state.allEvents.filter(event => event.resolved),
    
    // 所有事件總數
    allEventsCount: (state) => state.allEvents.length,
  },
  
  actions: {
    // 載入資安事件（只載入未處理的）
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
        
        // 如果有未處理的事件，啟動持續懲罰計時器
        if (this.unresolvedEvents.length > 0) {
          this.startPenaltyTimer();
        } else {
          // 如果沒有未處理的事件，確保計時器已停止
          this.stopPenaltyTimer();
        }
      } catch (error) {
        console.error('❌ 載入資安事件失敗:', error);
        this.unresolvedEvents = [];
      } finally {
        this.loading = false;
      }
    },
    
    // 載入所有資安事件（包括已解決的）
    async loadAllSecurityEvents() {
      const authStore = useAuthStore();
      if (!authStore.user?.uid) {
        console.warn('loadAllSecurityEvents: 缺少 userId');
        return;
      }
      
      this.loading = true;
      try {
        const events = await apiService.getSecurityEvents(authStore.user.uid);
        this.allEvents = events;
        this.unresolvedEvents = events.filter(event => !event.resolved);
        console.log('📜 載入所有資安事件:', this.allEvents.length, '個事件（', this.unresolvedEvents.length, '個未處理）');
      } catch (error) {
        console.error('❌ 載入所有資安事件失敗:', error);
        this.allEvents = [];
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
            
            // 如果這是第一個未處理事件，啟動持續懲罰計時器
            if (this.unresolvedEvents.length === 1) {
              this.startPenaltyTimer();
            }
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
        
        // 如果沒有未處理的事件了，停止持續懲罰計時器
        if (this.unresolvedEvents.length === 0) {
          this.stopPenaltyTimer();
        }
        
        // 刷新玩家資料以更新 eventResolvedCount
        try {
          const { usePlayerStore } = await import('./player');
          const playerStore = usePlayerStore();
          await playerStore.loadPlayerData();
        } catch (e) {
          console.warn('刷新玩家資料失敗（忽略）:', e);
        }
        
        // 檢查成就（基於最新的 eventResolvedCount）
        try {
          const { useAchievementStore } = await import('./achievement');
          const achievementStore = useAchievementStore();
          await achievementStore.checkAllAchievements();
        } catch (e) {
          console.warn('檢查成就失敗（忽略）:', e);
        }
        
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
      this.stopPenaltyTimer();
    },
    
    // 啟動持續懲罰計時器
    startPenaltyTimer() {
      // 防止重複啟動
      if (this.penaltyInterval) {
        return;
      }
      
      console.log('⏰ 啟動資安事件持續懲罰計時器（每30秒檢查一次）');
      
      this.penaltyInterval = setInterval(async () => {
        if (this.unresolvedEvents.length > 0) {
          const playerStore = usePlayerStore();
          
          // 計算總懲罰（每個未處理事件扣除科技點50和防禦值10）
          const totalPenalty = this.unresolvedEvents.length;
          const techPointsPenalty = totalPenalty * 50;
          const defensePenalty = totalPenalty * 10;
          
          console.log(`⚠️ 持續懲罰觸發！未處理事件數: ${totalPenalty}`);
          console.log(`   扣除科技點: -${techPointsPenalty}, 防禦值: -${defensePenalty}`);
          
          // 扣除科技點和防禦值（不會低於0）
          const newTechPoints = Math.max(0, playerStore.techPoints - techPointsPenalty);
          const newDefense = Math.max(0, playerStore.defense - defensePenalty);
          
          console.log(`   科技點: ${playerStore.techPoints} → ${newTechPoints}`);
          console.log(`   防禦值: ${playerStore.defense} → ${newDefense}`);
          
          // 更新玩家資料
          try {
            await playerStore.updateTechPoints(newTechPoints);
            await playerStore.updateDefense(newDefense);
            console.log('✅ 持續懲罰已套用');
          } catch (error) {
            console.error('❌ 套用持續懲罰失敗:', error);
          }
        }
      }, 30000); // 每30秒執行一次
    },
    
    // 停止持續懲罰計時器
    stopPenaltyTimer() {
      if (this.penaltyInterval) {
        clearInterval(this.penaltyInterval);
        this.penaltyInterval = null;
        console.log('⏰ 資安事件持續懲罰計時器已停止');
      }
    }
  }
});
