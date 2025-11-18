import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService';


export const useWallStore = defineStore('wall', {
  state: () => ({
    castleLevel: 0,
    initialized: false,
    castleUpgradeMessage: null,
    castleDowngradeMessage: null,
  }),

  getters: {
    // 從 playerStore 獲取總防禦力
    totalDefensePoints() {
      const playerStore = usePlayerStore();
      return playerStore.defense;
    },
    // 計算總防禦力
    totalDefense: () => {
      const playerStore = usePlayerStore();
      return playerStore.defense;
    },
    // 下一個升級門檻（每 150 點）
    nextDefenseThreshold() {
      const playerStore = usePlayerStore();
      const block = 150;
      const levelIndex = Math.floor(playerStore.defense / block) + 1;
      return levelIndex * block;
    },

    defenseProgressText() {
      const playerStore = usePlayerStore();
      const block = 150;
      const next = (Math.floor(playerStore.defense / block) + 1) * block;
      return `${playerStore.defense}/${next}`;
    }
  },

  actions: {

    upgradeCastle() {
      const playerStore = usePlayerStore();
      const requiredDefense = (this.castleLevel + 1) * 150;
      
      if (playerStore.defense >= requiredDefense) {
        this.castleLevel++;
      } else {
        return false;
      }
    },

    // 更新防禦點數並檢查是否可以升級
    async updateDefensePoints(newValue) {
      const playerStore = usePlayerStore();
      await playerStore.updateDefense(newValue);
      this.checkCastleUpgrade();
    },

    // 檢查是否可以升級
    checkCastleUpgrade() {
      const playerStore = usePlayerStore();
      const requiredDefense = (this.castleLevel + 1) * 150;
      if (playerStore.defense >= requiredDefense) {
        this.upgradeCastle();
      }
    },

    // 載入等級
    async loadCastleLevel() {
      try {
        const playerStore = usePlayerStore();
        if (!playerStore.userId) {
          console.warn('尚未登入，無法載入公網塔等級');
          return;
        }
        const playerData = await apiService.getPlayer(playerStore.userId);
        
        if (playerData.castleLevel !== undefined) {
          this.castleLevel = playerData.castleLevel;
          console.log('公網塔等級已載入:', this.castleLevel);
        }
        
        this.initialized = true;
      } catch (error) {
        console.error('載入公網塔等級失敗:', error);
        this.castleLevel = 0;
        this.initialized = true;
      }
    },

    // 更新公網塔等級到資料庫
    async updateCastleLevel(newLevel) {
      try {
        const playerStore = usePlayerStore();
        if (!playerStore.userId) {
          console.warn('尚未登入，無法更新公網塔等級');
          return;
        }
        const currentUserId = playerStore.userId;
        
        await apiService.updatePlayerCastleLevel(currentUserId, newLevel);
        this.castleLevel = newLevel;
        
        // 同步到 playerStore
        playerStore.castleLevel = newLevel;
        
        // 刷新玩家資料以確保資料同步
        await playerStore.loadPlayerData();
        
        // 檢查成就（基於最新的 castleLevel）
        try {
          const { useAchievementStore } = await import('./achievement');
          const achievementStore = useAchievementStore();
          await achievementStore.checkAllAchievements();
        } catch (e) {
          console.warn('檢查成就失敗（忽略）:', e);
        }
        
        console.log('公網塔等級已更新到資料庫:', newLevel);
      } catch (error) {
        console.error('更新公網塔等級失敗:', error);
      }
    },


    calculateCastleLevel() {
      const playerStore = usePlayerStore();
      return Math.floor(playerStore.defense / 150);
    },

    async syncCastleLevel() {
      const playerStore = usePlayerStore();
      const currentDefense = playerStore.defense;
      const targetLevel = this.calculateCastleLevel();
      
      console.log(`公網塔等級同步檢查: 防禦值=${currentDefense}, 當前等級=${this.castleLevel}, 目標等級=${targetLevel}`);
      
      if (targetLevel !== this.castleLevel) {
        if (targetLevel > this.castleLevel) {          
          this.showCastleUpgradeMessage(targetLevel);
        } else {  
          this.showCastleDowngradeMessage(targetLevel);
        }
        await this.updateCastleLevel(targetLevel);
        
        this.triggerMapRedraw();
      } else {
        console.log(`公網塔等級無需變更，保持等級 ${this.castleLevel}`);
      }
    },

    showCastleUpgradeMessage(newLevel) {
      this.castleUpgradeMessage = '網路連線升級！小鎮的信件在郵路上的傳遞速度變得更快、更穩定。';
      setTimeout(() => {
        this.castleUpgradeMessage = null;
      }, 6000);
    },

    showCastleDowngradeMessage(newLevel) {
      this.castleDowngradeMessage = '網路連線下降了……郵路有點塞車，小鎮的信件傳遞變慢了。';
      setTimeout(() => {
        this.castleDowngradeMessage = null;
      }, 6000);
    },

    // 觸發地圖重繪
    triggerMapRedraw() {      
      console.log('觸發地圖重繪以更新公網塔等級');
    },
  }
});
