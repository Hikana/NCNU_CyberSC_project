// apiService.js
import { getAuth } from 'firebase/auth';

const API_BASE_URL = "http://localhost:3000/api/game"; // 修復：原本是 API_BASE
const PLAYER_BASE_URL = "http://localhost:3000/api/players";
const BUILDING_BASE_URL = "http://localhost:3000/api/buildings";

// 取得目前登入使用者的 UID，若不存在則回傳 null
function getCurrentUid() {
  try {
    const auth = getAuth();
    return auth.currentUser?.uid || null;
  } catch (_) {
    return null;
  }
}

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
      // 處理認證錯誤
      if (response.status === 401) {
        const errorMessage = result.error || result.message || '認證失敗，請重新登入';
        throw new Error(errorMessage);
      }
      
      // 改進錯誤處理，顯示更詳細的錯誤信息
      console.error(`❌ API 錯誤詳情:`, {
        status: response.status,
        statusText: response.statusText,
        result: result,
        url: url
      });
      
      const errorMessage = result.message || result.error || result.details || `API 請求失敗 (狀態碼: ${response.status})`;
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

    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      // 盡量給出可用錯誤訊息
      throw new Error(text || '非 JSON 回應');
    }

    if (!response.ok) {
      const message = result?.message || result?.error || `API 請求失敗 (狀態碼: ${response.status})`;
      throw new Error(message);
    }

    // 後端多數回傳 { success, data }
    return result?.data ?? result;
  } catch (error) {
    console.error(`❌ 背包 API 錯誤 at ${url}:`, error);
    throw error;
  }
}

export const apiService = {
  // --- 答題相關 ---
  getRandomQuestion: () => request('/random-question'),

  submitAnswer: (questionId, answer) =>
    request('/submit-answer', {
      method: 'POST',
      body: { questionId, answer },
    }),

  validateAnswer: (questionId, answer) =>
    request(`/questions/${questionId}/validate`, {
      method: 'POST',
      body: { answer },
    }),

  // --- 建築系統 API ---
  
  // 取得地圖狀態
  getMap: async (userId) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法取得地圖');
    const url = `${BUILDING_BASE_URL}/map?userId=${encodeURIComponent(uid)}`;
    return requestInventory(url);
  },

  // 放置建築
  placeBuilding: async (buildingId, position, userId) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法放置建築');
    const url = `${BUILDING_BASE_URL}/place`;
    return requestInventory(url, { method: 'POST', body: { buildingId, position, userId: uid } });
  },

  // 架設防火牆
  placeFirewall: async (itemId, position, userId) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法架設防火牆');
    const url = `${BUILDING_BASE_URL}/firewall`;
    return requestInventory(url, { method: 'POST', body: { itemId, position, userId: uid } });
  },

  // 移除建築
  removeBuilding: async (x, y, userId) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法移除建築');
    const url = `${BUILDING_BASE_URL}/remove/${x}/${y}?userId=${encodeURIComponent(uid)}`;
    return requestInventory(url, { method: 'DELETE' });
  },

  // 取得建築商店列表
  getBuildingShop: () => {
    return fetch(`${BUILDING_BASE_URL}/shop`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || '取得建築商店失敗');
        return json.data;
      });
  },

  // --- 地圖功能（保留在 game API 中） ---
  unlockTile: (position, userId) => {
    const uid = userId || getCurrentUid();
    if (!uid) return Promise.reject(new Error('尚未登入，無法解鎖地塊'));
    return request('/unlock-tile', { method: 'POST', body: { position, userId: uid } });
  },

  // 向後相容的 clearBuilding（重導向到新的 removeBuilding）
  clearBuilding: (position, userId) => {
    const { x, y } = position;
    return apiService.removeBuilding(x, y, userId);
  },

  // --- 歷史紀錄 ---
  getHistory: () => request('/history'),

  addHistoryEntry: (entryData) =>
    request('/history', {
      method: 'POST',
      body: entryData,
    }),

// 拿自己的答題紀錄
  getMyHistory: () => request('/history/me'),

  // --- 玩家背包 API （統一 /api/inventory/me）---
  getInventory: () => {
    const url = `http://localhost:3000/api/inventory/me`;
    return requestInventory(url);
  },

  setInventory: (items) => {
    if (!Array.isArray(items)) {
      return Promise.reject(new Error('items 必須是陣列'));
    }
    const url = `http://localhost:3000/api/inventory/me`;
    return requestInventory(url, { method: 'POST', body: { items } });
  },

  // --- 玩家資料 API ---
  
  // 取得玩家資料（統一 /me）
  getPlayer: async () => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法取得玩家資料');
    const url = `${PLAYER_BASE_URL}/me`;
    return requestInventory(url);
  },

  // 更新玩家科技點
  updatePlayerTechPoints: async (_userId, techPoints) => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法更新科技點');
    const url = `${PLAYER_BASE_URL}/me/techPoints`;
    return requestInventory(url, { method: 'PUT', body: { techPoints } });
  },

  // 更新玩家防禦值
  updatePlayerDefense: async (_userId, defense) => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法更新防禦值');
    const url = `${PLAYER_BASE_URL}/me/defense`;
    return requestInventory(url, { method: 'PUT', body: { defense } });
  },

  // 更新玩家伺服器等級
  updatePlayerCastleLevel: async (_userId, castleLevel) => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法更新伺服器等級');
    const url = `${PLAYER_BASE_URL}/me/castleLevel`;
    return requestInventory(url, { method: 'PUT', body: { castleLevel } });
  },

  // --- 成就系統 API ---
  
  // 取得所有成就
  getAchievements: () => {
    return fetch(`${PLAYER_BASE_URL}/achievements`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || '取得成就失敗');
        return json.data;
      });
  },

  // 取得玩家成就進度
  getPlayerAchievements: async () => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法取得玩家成就');
    const url = `${PLAYER_BASE_URL}/me/achievements`;
    return requestInventory(url);
  },

  // 更新玩家成就狀態（領取獎勵）
  updatePlayerAchievement: async (_userId, achievementId, updateData) => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法更新成就');
    const url = `${PLAYER_BASE_URL}/me/achievements/${encodeURIComponent(achievementId)}`;
    return requestInventory(url, { method: 'PUT', body: updateData });
  },

  // 檢查並更新成就進度
  checkAchievements: async (_userId, gameStats) => {
    const uid = getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法檢查成就');
    const url = `${PLAYER_BASE_URL}/me/achievements/check`;
    return requestInventory(url, { method: 'POST', body: { gameStats } });
  },
  // --- 防禦工具相關 ---
  
  // 使用防禦工具
  useDefenseTool: (toolId) => {
    const url = `http://localhost:3000/api/inventory/use-tool`;
    return requestInventory(url, { 
      method: 'POST', 
      body: { toolId } 
    });
  },

  // --- 資安事件相關 ---
  
  // 獲取玩家的資安事件紀錄
  getSecurityEvents: async (userId) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法取得資安事件');
    const url = `http://localhost:3000/api/events/${encodeURIComponent(uid)}`;
    return requestInventory(url);
  },

  // 新增資安事件
  addSecurityEvent: async (userId, eventData) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法新增資安事件');
    const url = `http://localhost:3000/api/events/${encodeURIComponent(uid)}`;
    return requestInventory(url, { method: 'POST', body: eventData });
  },

  // 解決資安事件
  resolveSecurityEvent: async (userId, eventId, usedItemId) => {
    const uid = userId || getCurrentUid();
    if (!uid) throw new Error('尚未登入，無法解決資安事件');
    const url = `http://localhost:3000/api/events/${encodeURIComponent(uid)}/${encodeURIComponent(eventId)}/resolve`;
    return requestInventory(url, { method: 'PUT', body: { usedItemId } });
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

  // --- 連線相關 API ---
  // 取得連線列表
  getConnections: async (userId) => {
    return requestInventory(`${BUILDING_BASE_URL}/connections`, { method: 'GET' });
  },

  // 添加連線
  addConnection: async (connection, userId) => {
    return requestInventory(`${BUILDING_BASE_URL}/connections`, {
      method: 'POST',
      body: { connection }
    });
  },

  // 刪除連線
  removeConnection: async (connectionId, userId) => {
    return requestInventory(`${BUILDING_BASE_URL}/connections/${connectionId}`, {
      method: 'DELETE'
    });
  },
};

// 默認導出
export default apiService;