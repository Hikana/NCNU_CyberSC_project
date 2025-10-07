import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { apiService } from '@/services/apiService';


export const useWallStore = defineStore('wall', {
  state: () => ({
    // 城堡等級
    castleLevel: 0,
    // 是否已初始化
    initialized: false
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
    // 顯示用進度文字，例如 45/150、190/300
    defenseProgressText() {
      const playerStore = usePlayerStore();
      const block = 150;
      const next = (Math.floor(playerStore.defense / block) + 1) * block;
      return `${playerStore.defense}/${next}`;
    }
  },

  actions: {
    // 城堡升級 - 當城牆防禦力達到150倍數時自動升級
    upgradeCastle() {
      const playerStore = usePlayerStore();
      const requiredDefense = (this.castleLevel + 1) * 150;
      
      if (playerStore.defense >= requiredDefense) {
        this.castleLevel++;
        console.log(`城堡自動升級成功！目前等級: ${this.castleLevel}，需要防禦力: ${requiredDefense}`);
        return true;
      } else {
        console.log(`防禦力不足！需要 ${requiredDefense} 防禦力才能升級，目前有 ${playerStore.defense}`);
        return false;
      }
    },

    // 更新防禦點數並檢查是否可以升級城堡
    async updateDefensePoints(newValue) {
      const playerStore = usePlayerStore();
      await playerStore.updateDefense(newValue);
      // 檢查是否可以升級城堡
      this.checkCastleUpgrade();
    },

    // 檢查城堡是否可以升級
    checkCastleUpgrade() {
      const playerStore = usePlayerStore();
      const requiredDefense = (this.castleLevel + 1) * 150;
      if (playerStore.defense >= requiredDefense) {
        this.upgradeCastle();
      }
    },

    // 載入城堡等級
    async loadCastleLevel() {
      try {
        const playerStore = usePlayerStore();
        if (!playerStore.userId) {
          console.warn('⚠️ 尚未登入，無法載入城堡等級');
          return;
        }
        const playerData = await apiService.getPlayer(playerStore.userId);
        
        if (playerData.castleLevel !== undefined) {
          this.castleLevel = playerData.castleLevel;
          console.log('✅ 城堡等級已載入:', this.castleLevel);
        }
        
        this.initialized = true;
      } catch (error) {
        console.error('載入城堡等級失敗:', error);
        this.castleLevel = 0;
        this.initialized = true;
      }
    },

    // 更新城堡等級到資料庫
    async updateCastleLevel(newLevel) {
      try {
        const playerStore = usePlayerStore();
        if (!playerStore.userId) {
          console.warn('⚠️ 尚未登入，無法更新城堡等級');
          return;
        }
        const currentUserId = playerStore.userId;
        
        await apiService.updatePlayerCastleLevel(currentUserId, newLevel);
        this.castleLevel = newLevel;
        
        console.log('✅ 城堡等級已更新到資料庫:', newLevel);
      } catch (error) {
        console.error('更新城堡等級失敗:', error);
      }
    },

    // 計算當前應該的城堡等級（基於防禦值）
    calculateCastleLevel() {
      const playerStore = usePlayerStore();
      return Math.floor(playerStore.defense / 150);
    },

    // 同步城堡等級（根據防禦值自動調整，可升級也可降級）
    async syncCastleLevel() {
      const targetLevel = this.calculateCastleLevel();
      
      if (targetLevel !== this.castleLevel) {
        if (targetLevel > this.castleLevel) {
          console.log(`🏰 城堡自動升級: ${this.castleLevel} -> ${targetLevel}`);
        } else {
          console.log(`🏰 城堡自動降級: ${this.castleLevel} -> ${targetLevel}`);
        }
        await this.updateCastleLevel(targetLevel);
      }
    }
  }
});
