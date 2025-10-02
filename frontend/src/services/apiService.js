// apiService.js
import { getAuth } from 'firebase/auth';

const API_BASE_URL = "http://localhost:3000/api/game"; // 修復：原本是 API_BASE
const PLAYER_BASE_URL = "http://localhost:3000/api/players";

async function request(endpoint, options = {}) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    // ✅ 如果使用者已登入，就獲取他的 ID Token
    const token = user ? await user.getIdToken() : null;

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      // ✅ 在請求的 Header 中附上 Token，格式為 'Bearer <token>'
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { 
      method: 'GET', 
      ...options, 
      headers: {
        ...headers,
        ...options.headers // 允許覆蓋預設 headers
      }
    };
    
    if (config.body) { 
      config.body = JSON.stringify(config.body); 
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🔄 API 請求: ${config.method} ${url}`);

    const response = await fetch(url, config);
    
    // 檢查 response 是否為 JSON 格式
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      const errorMessage = result.message || result || `API 請求失敗 (狀態碼: ${response.status})`;
      throw new Error(errorMessage);
    }

    console.log(`✅ API 成功: ${config.method} ${url}`);
    return result;
  } catch (error) {
    console.error(`❌ API Service Error at ${endpoint}:`, error);
    throw error;
  }
}

// 專門處理背包 API 的函數（使用不同的認證方式）
async function requestInventory(url, options = {}) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: 'GET',
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    console.log(`🔄 背包 API 請求: ${config.method} ${url}`);
    
    const response = await fetch(url, config);
    const json = await response.json();
    
    if (!response.ok || !json.success) {
      throw new Error(json.message || '背包 API 請求失敗');
    }

    console.log(`✅ 背包 API 成功: ${config.method} ${url}`);
    return json.data;
  } catch (error) {
    console.error(`❌ 背包 API 錯誤 at ${url}:`, error);
    throw error;
  }
}

export const apiService = {
  // --- 答題相關 ---
  getRandomQuestion: () => request('/random-question'),

  submitAnswer: (userId, questionId, answer) =>
    request('/submit-answer', {
      method: 'POST',
      body: { userId, questionId, answer }, // 一定要帶 userId
    }),

  validateAnswer: (questionId, answer) =>
    request(`/questions/${questionId}/validate`, {
      method: 'POST',
      body: { answer },
    }),

  // --- 地圖功能 ---
  getMap: () => request('/map'),

  placeBuilding: (buildingId, position) =>
    request('/place-building', {
      method: 'POST',
      body: { buildingId, position },
    }),

  unlockTile: (position) =>
    request('/unlock-tile', {
      method: 'POST',
      body: { position },
    }),

  clearBuilding: (position) =>
    request('/clear-building', {
      method: 'POST',
      body: { position },
    }),

  // --- 歷史紀錄 ---
  getHistory: () => request('/history'),

  addHistoryEntry: (entryData) =>
    request('/history', {
      method: 'POST',
      body: entryData,
    }),

// 拿自己的答題紀錄
  getMyHistory: () => request('/history/me'),

  // --- 玩家背包 API （使用統一的認證方式）---
  getInventory: (userId) => {
    if (!userId) {
      return Promise.reject(new Error('userId 是必需的'));
    }
    
    const url = `${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/inventory`;
    return requestInventory(url);
  },

  setInventory: (userId, items) => {
    if (!userId) {
      return Promise.reject(new Error('userId 是必需的'));
    }
    
    if (!Array.isArray(items)) {
      return Promise.reject(new Error('items 必須是陣列'));
    }

    const url = `${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/inventory`;
    return requestInventory(url, {
      method: 'POST',
      body: { items }
    });
  },

  // --- 額外的工具方法 ---
  // 檢查 API 連接狀態
  checkConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API 連接檢查失敗:', error);
      return false;
    }
  },

  // 獲取用戶資訊
  getUserInfo: () => request('/user/info'),

  // 更新用戶資料
  updateUser: (userData) => request('/user/update', {
    method: 'PUT',
    body: userData
  }),
  getPlayerState: () => request('/player/me'),
};

// 默認導出
export default apiService;