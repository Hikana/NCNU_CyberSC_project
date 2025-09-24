import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
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
   * 玩家擁有的科技點
   */
  const techPoints = ref(100);

  /**
   * 玩家在遊戲世界中的邏輯座標
   * 由 PixiJS 的遊戲循環 (gameLoop) 負責更新
   */
  const position = reactive({
    x: 0,
    y: 0
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
  function addTechPoints(amount) {
    techPoints.value += amount;
  }

  /**
   * 花費科技點 (一個安全的操作)
   * @param {number} cost - 要花費的數量
   * @returns {boolean} - 回傳 true 代表成功，false 代表失敗 (點數不足)
   */
  function spendTechPoints(cost) {
    if (techPoints.value >= cost) {
      techPoints.value -= cost;
      console.log(`花費 ${cost} 科技點，剩餘: ${techPoints.value}`);
      return true;
    } else {
      console.warn(`科技點不足！需要 ${cost}，但只有 ${techPoints.value}`);
      return false;
    }
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
    spendTechPoints,
    startResourceGeneration,
    stopResourceGeneration,
  }
});