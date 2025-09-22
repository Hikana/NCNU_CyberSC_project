const API_BASE = "http://localhost:3000/api/game";

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
      body: { userId, questionId, answer }, // ✅ 一定要有 userId
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
};
