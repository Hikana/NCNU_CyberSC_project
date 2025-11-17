// frontend/src/stores/historyStore.js
import { defineStore } from 'pinia';
import { apiService } from '../services/apiService';
import { useAuthStore } from './authStore';   

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: [],
    isLoading: false,
    error: null,
    isInitialized: false, // 👈 新增：標記是否已初始化
  }),

  getters: {
    historyList: (state) => state.history
  },

  actions: {
    /**
     * 初始化 store，確保歷史記錄已載入
     */
    async initialize() {
      if (!this.isInitialized) {
        console.log('🔄 初始化 historyStore...');
        await this.fetchHistory();
        this.isInitialized = true;
      }
    },

    /**
     * 從後端獲取所有答題紀錄
     */
    async fetchHistory() {
      const authStore = useAuthStore();
      // ✅ 如果玩家沒有登入，就直接停止，不執行任何操作
      if (!authStore.user) {
          console.warn('無法獲取歷史紀錄：使用者未登入');
          this.history = []; // 確保登出後列表會清空
          return;
      }
      this.isLoading = true;
      this.error = null;
      
      try {
        
        const response = await apiService.getHistory();
        if (response.success) {
          this.history = response.data;
          console.log(`✅ 成功獲取玩家 ${authStore.user.uid} 的答題紀錄:`, this.history.length, '筆');
        } else {
          throw new Error(response.message || '獲取紀錄失敗');
        }
      } catch (err) {
        this.error = err.message;
        console.error('❌ 獲取答題紀錄失敗:', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 載入使用者歷史紀錄（供 authStore 呼叫）
     */
    async loadUserHistory() {
      console.log('🔄 載入使用者歷史紀錄...');
      await this.fetchHistory(); // 直接使用原有的 fetchHistory 方法
    },

    /**
     * 將新的答題紀錄加到前端列表
     * @param {object} entryData - 答題紀錄物件
     */
    async addUserHistoryEntry(entryData) {
      if (!entryData) {
        console.log('❌ addUserHistoryEntry 收到空資料');
        return;
      }

      // 確保在添加記錄前，歷史記錄已經載入
      await this.initialize();

      console.log('📝 historyStore 收到新答題記錄:', entryData);
      this.history.unshift(entryData);
      console.log('📝 historyStore 目前記錄數:', this.history.length);
      console.log('📝 historyStore 最新記錄:', this.history[0]);
      console.log('📝 新增答題紀錄成功');
    },

    /**
     * 添加事件記錄到歷史（用於未解決的資安事件）
     * @param {object} eventData - 事件記錄物件
     */
    async addEventLogEntry(eventData) {
      if (!eventData) {
        console.log('❌ addEventLogEntry 收到空資料');
        return;
      }

      try {
        // 調用後端API保存事件記錄
        await apiService.addEventLogEntry(eventData);
        
        // 確保在添加記錄前，歷史記錄已經載入
        await this.initialize();

        this.history.unshift(eventData);
        console.log('📜 historyStore 目前記錄數:', this.history.length);
        console.log('📜 historyStore 最新記錄:', this.history[0]);
      } catch (error) {
        console.error('❌ 添加事件記錄失敗:', error);
        // 即使後端失敗，也添加到本地列表
        await this.initialize();
        this.history.unshift(eventData);
      }
    },

    /**
     * 清空所有紀錄
     */
    clearOnLogout() {
      this.history = [];
      this.isInitialized = false; // 👈 重置初始化狀態
      console.log('🗑️ 已清空所有答題紀錄');
    }
  },
});