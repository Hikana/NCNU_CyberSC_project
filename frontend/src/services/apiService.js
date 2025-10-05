const API_BASE = "http://localhost:3000/api/game";
const PLAYER_BASE_URL = "http://localhost:3000/api/players";
const BUILDING_BASE_URL = "http://localhost:3000/api/buildings";

async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗 (狀態碼: ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API 請求錯誤 at ${url}:`, error);
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

  // --- 建築系統 API ---
  
  // 取得地圖狀態
  getMap: (userId = 'test-user') => {
    const url = `${BUILDING_BASE_URL}/map?userId=${encodeURIComponent(userId)}`;
    
    return fetch(url)
      .then(async (res) => {
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || '取得地圖失敗');
        }
        
        return json.data;
      });
  },

  // 放置建築
  placeBuilding: (buildingId, position, userId = 'test-user') => {
    return fetch(`${BUILDING_BASE_URL}/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buildingId, position, userId }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '放置建築失敗');
      return json; // 回傳完整的回應物件，包含 success 和 data
    });
  },

  // 移除建築
  removeBuilding: (x, y, userId = 'test-user') => {
    return fetch(`${BUILDING_BASE_URL}/${x}/${y}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '移除建築失敗');
      return json.data;
    });
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
  unlockTile: (position, userId = 'test-user') =>
    request('/unlock-tile', {
      method: 'POST',
      body: { position, userId },
    }),

  // 向後相容的 clearBuilding（重導向到新的 removeBuilding）
  clearBuilding: (position, userId = 'test-user') => {
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

  // --- 玩家背包 API ---
  getInventory: (userId) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/inventory`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || '取得背包失敗');
        return json.data;
      });
  },

  setInventory: (userId, items) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '更新背包失敗');
      return json.data;
    });
  },

  // --- 玩家資料 API ---
  
  // 取得玩家資料
  getPlayer: (userId) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || '取得玩家資料失敗');
        return json.data;
      });
  },

  // 更新玩家科技點
  updatePlayerTechPoints: (userId, techPoints) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/techPoints`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ techPoints }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '更新科技點失敗');
      return json.data;
    });
  },

  // 更新玩家防禦值
  updatePlayerDefense: (userId, defense) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/defense`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defense }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '更新防禦值失敗');
      return json.data;
    });
  },

  // 更新玩家城堡等級
  updatePlayerCastleLevel: (userId, castleLevel) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/castleLevel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ castleLevel }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '更新城堡等級失敗');
      return json.data;
    });
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
  getPlayerAchievements: (userId) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/achievements`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || '取得玩家成就失敗');
        return json.data;
      });
  },

  // 更新玩家成就狀態（領取獎勵）
  updatePlayerAchievement: (userId, achievementId, updateData) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/achievements/${encodeURIComponent(achievementId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '更新成就失敗');
      return json.data;
    });
  },

  // 檢查並更新成就進度
  checkAchievements: (userId, gameStats) => {
    return fetch(`${PLAYER_BASE_URL}/${encodeURIComponent(userId)}/achievements/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameStats }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '檢查成就失敗');
      return json.data;
    });
  },
};
