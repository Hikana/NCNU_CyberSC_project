const API_BASE_URL = 'http://localhost:3000/api/game';

/**
 * 統一處理 fetch 請求的函式
 * @param {string} endpoint - API 的路徑, 例如 '/questions'
 * @param {object} options - fetch 的設定物件
 * @returns {Promise<any>} - 回傳 API 的 data 部分
 */
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'API 請求失敗');
    }
    return result.data;
  } catch (error) {
    console.error(`API 請求錯誤 at ${endpoint}:`, error);
    throw error; // 將錯誤繼續向上拋出，讓呼叫者可以處理
  }
}

// 導出所有前端會用到的 API 函式
export const apiService = {
  /**
   * 取得一筆隨機題目
   * @param {number} level - 題目的等級
   */
  getRandomQuestion: (level = 1) => {
    return request(`/questions/random?level=${level}`);
  },
  
  /**
   * 驗證答案
   * @param {string} questionId - 題目 ID
   * @param {string} answer - 使用者答案
   */
  validateAnswer: (questionId, answer) => {
    return request(`/questions/${questionId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
    });
  },
  // --- 新增：答題紀錄 API ---
  
  /**
   * 獲取所有答題紀錄
   */
  getHistory: () => {
    return request('/history');
  },

  /**
   * 新增一筆答題紀錄
   * @param {object} entryData - 要新增的紀錄物件
   */
  addHistoryEntry: (entryData) => {
    return request('/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData),
    });
  },
};