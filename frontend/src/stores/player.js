import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { apiService } from '@/services/apiService';
import { auth } from '@/firebase/firebase';

export const usePlayerStore = defineStore('player', () => {
  // --- State (狀態) ---
  
  /**
   * 玩家在遊戲世界中的邏輯座標
   */
  const x = ref(18);
  const y = ref(5);
  
  /**
   * Firebase 使用者 ID，用於 Firestore 對應玩家文件
   */
  const playerId = ref(null);
  
  /**
   * 玩家擁有的科技點（從後端同步）
   */
  const techPoints = ref(0);

  /**
   * 玩家擁有的防禦值（從後端同步）
   */
  const defense = ref(120);

  /**
   * 玩家在遊戲世界中的邏輯座標
   * 由 PixiJS 的遊戲循環 (gameLoop) 負責更新
   * 初始位置設在網格 (3, 3) 避免在城堡區域內
   */
  const position = reactive({
    x: 0, // 等角座標 X，將在遊戲初始化時設置
    y: 0  // 等角座標 Y，將在遊戲初始化時設置
  });
  
  const correctlyAnsweredCount = ref(0); // 記錄答對總題數

  // --- Actions (方法) ---
  
  let resourceInterval = null; // 用來存放 setInterval 的 ID，方便之後清除

  /**
   * 移動方法
   */
  function moveUp() {
    if (y.value > 0) y.value--;
  }
  
  function moveDown() {
    if (y.value < 19) y.value++;
  }
  
  function moveLeft() {
    if (x.value > 0) x.value--;
  }
  
  function moveRight() {
    if (x.value < 19) x.value++;
  }

  /**
   * 啟動資源的自動增長
   * 這個 action 應該在遊戲開始時 (例如在 GamePage.vue 的 onMounted) 被呼叫一次
   */
  function startResourceGeneration() {
    // 防止重複啟動計時器
    if (resourceInterval) clearInterval(resourceInterval);
    
    resourceInterval = setInterval(() => {
      techPoints.value += 1; // 根據你的遊戲設計，這裡可以調整增加的數值
    }, 60000); // 60000 毫秒 = 1 分鐘
  }
  
  /**
   * 停止資源的自動增長
   * 在遊戲結束或暫停時可以呼叫
   */
  function stopResourceGeneration() {
      if (resourceInterval) {
        clearInterval(resourceInterval);
        resourceInterval = null;
      }
  }

  /**
   * 設定玩家 ID（登入後呼叫）
   */
  function setPlayerId(id) {
    playerId.value = id || null;
  }

  /**
   * 從 Firebase Auth 初始化玩家 ID（若已登入）
   */
  function initFromAuth() {
    const uid = auth.currentUser?.uid || null;
    if (uid) playerId.value = uid;
    return playerId.value;
  }

  /**
   * 從後端載入玩家資料
   */
  async function loadPlayerData() {
    try {
      const uid = playerId.value || auth.currentUser?.uid || null;
      if (!uid) {
        console.warn('⚠️ 無法載入玩家資料：尚未登入（無 uid）');
        return;
      }
      const playerData = await apiService.getPlayer(uid);
      
      // 更新本地狀態
      techPoints.value = playerData.techPoints || 0;
      defense.value = playerData.defense || 120;
      correctlyAnsweredCount.value = playerData.answeredCount || 0;
      
      console.log('✅ 玩家資料已從後端載入:', { techPoints: techPoints.value, defense: defense.value, answeredCount: correctlyAnsweredCount.value });
    } catch (error) {
      console.error('載入玩家資料失敗:', error);   
    }
  }

  /**
   * 重新整理玩家資料（用於建築放置後同步科技點）
   */
  async function refreshPlayerData() {
    await loadPlayerData();
  }

  /**
   * 更新玩家在地圖上的座標
   * @param {{ x: number, y: number }} newPosition - 包含新 x 和 y 座標的物件
   */
  function updatePosition(newPosition) {
    position.x = newPosition.x;
    position.y = newPosition.y;
  }

  /**
   * 增加科技點
   * @param {number} amount - 要增加的數量
   */
  async function addTechPoints(amount) {
    const newTechPoints = techPoints.value + amount;
    await updateTechPoints(newTechPoints);
  }

  /**
   * 更新科技點到資料庫
   * @param {number} newTechPoints - 新的科技點數
   */
  async function updateTechPoints(newTechPoints) {
    try {
      const uid = playerId.value || auth.currentUser?.uid || null;
      if (!uid) throw new Error('尚未登入，無法更新科技點');
      await apiService.updatePlayerTechPoints(uid, newTechPoints);
      techPoints.value = newTechPoints;
      console.log('✅ 科技點已更新到資料庫:', newTechPoints);
    } catch (error) {
      console.error('更新科技點失敗:', error);
    }
  }

  /**
   * 增加防禦值
   * @param {number} amount - 要增加的數量
   */
  function addDefense(amount) {
    defense.value += amount;
  }

  /**
   * 更新防禦值到資料庫
   * @param {number} newDefense - 新的防禦值
   */
  async function updateDefense(newDefense) {
    try {
      const uid = playerId.value || auth.currentUser?.uid || null;
      if (!uid) throw new Error('尚未登入，無法更新防禦值');
      await apiService.updatePlayerDefense(uid, newDefense);
      defense.value = newDefense;
      console.log('✅ 防禦值已更新到資料庫:', newDefense);
      
      // 同步城堡等級
      try {
        const { useWallStore } = await import('./wall');
        const wallStore = useWallStore();
        await wallStore.syncCastleLevel();
      } catch (error) {
        console.warn('同步城堡等級失敗:', error);
      }
    } catch (error) {
      console.error('更新防禦值失敗:', error);
    }
  }

  /**
   * 檢查是否有足夠的科技點（只檢查，不扣除）
   * @param {number} cost - 要檢查的數量
   * @returns {boolean} - 回傳 true 代表足夠，false 代表不足
   */
  function hasEnoughTechPoints(cost) {
    return techPoints.value >= cost;
  }
  
  // --- 新增：更新進度的方法 ---
  async function incrementCorrectlyAnsweredCount() {
    correctlyAnsweredCount.value++;
    console.log(`答對題數增加！目前總共答對 ${correctlyAnsweredCount.value} 題。`);
    
    // 檢查答題相關成就
    try {
      const { useAchievementStore } = await import('./achievement')
      const achievementStore = useAchievementStore()
      achievementStore.checkQuestionAchievements()
    } catch (error) {
      console.log('成就檢查失敗:', error)
    }
  }
  
  // 將所有需要讓外部 (Vue元件或其他 stores) 使用的 state 和 actions 在這裡 return
  return {
    x,
    y,
    playerId,
    techPoints,
    defense,
    position,
    correctlyAnsweredCount,
    setPlayerId,
    initFromAuth,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    incrementCorrectlyAnsweredCount,
    updatePosition,
    addTechPoints,
    updateTechPoints,
    addDefense,
    updateDefense,
    hasEnoughTechPoints,
    loadPlayerData,
    refreshPlayerData,
    startResourceGeneration,
    stopResourceGeneration,
  }
});