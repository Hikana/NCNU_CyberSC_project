// frontend/src/stores/historyStore.js

import { defineStore } from 'pinia';
import { apiService } from '../services/apiService';

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: [], // 存放所有答題紀錄的陣列
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * 從後端獲取所有答題紀錄
     */
    async fetchHistory() {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await apiService.getHistory();
        this.history = data;
        console.log('成功獲取答題紀錄:', this.history);
      } catch (err) {
        this.error = err.message;
        console.error('獲取答題紀錄失敗:', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 在後端新增一筆紀錄，並更新前端的列表
     * @param {object} entryData - { questionId, questionText, userAnswer, isCorrect }
     */
    async addHistoryEntry(entryData) {
      try {
        const newEntry = await apiService.addHistoryEntry(entryData);
        // 將新的紀錄加到列表的最前面
        this.history.unshift(newEntry); 
      } catch (err) {
        console.error('新增答題紀錄失敗:', err);
        // 這裡可以選擇是否要 alert 使用者
      }
    },
  },
});