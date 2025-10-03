// frontend/src/stores/historyStore.js
import { defineStore } from 'pinia';
import { apiService } from '../services/apiService';

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
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await apiService.getHistory();
        if (response.success) {
          this.history = response.data;
          console.log('✅ 成功獲取答題紀錄:', this.history);
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
     * 將新的答題紀錄加到前端列表
     * @param {object} entryData - 答題紀錄物件
     */
    async addHistoryEntry(entryData) {
      if (!entryData) {
        console.log('❌ addHistoryEntry 收到空資料');
        return;
      }

      // 👈 確保在添加記錄前，歷史記錄已經載入
      await this.initialize();

      console.log('🏪 historyStore 收到新記錄:', entryData);
      this.history.unshift(entryData);
      console.log('🏪 historyStore 目前記錄數:', this.history.length);
      console.log('🏪 historyStore 最新記錄:', this.history[0]);
      console.log('📝 新增答題紀錄成功');
    },

    /**
     * 清空所有紀錄
     */
    clearHistory() {
      this.history = [];
      this.isInitialized = false; // 👈 重置初始化狀態
      console.log('🗑️ 已清空所有答題紀錄');
    }
  },
});