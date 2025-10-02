import { defineStore } from 'pinia';
import { usePlayerStore } from './player';

export const useWallStore = defineStore('wall', {
  state: () => ({
    // 總防禦點數
    totalDefensePoints: 30,
    
    // 城堡等級
    castleLevel: 0
  }),

  getters: {
    // 計算總防禦力
    totalDefense: (state) => {
      return state.totalDefensePoints;
    },
    // 下一個升級門檻（每 150 點）
    nextDefenseThreshold: (state) => {
      const block = 150;
      const levelIndex = Math.floor(state.totalDefensePoints / block) + 1;
      return levelIndex * block;
    },
    // 顯示用進度文字，例如 45/150、190/300
    defenseProgressText: (state) => {
      const block = 150;
      const next = (Math.floor(state.totalDefensePoints / block) + 1) * block;
      return `${state.totalDefensePoints}/${next}`;
    }
  },

  actions: {
    // 城堡升級 - 當城牆防禦力達到150倍數時自動升級
    upgradeCastle() {
      const requiredDefense = (this.castleLevel + 1) * 150;
      
      if (this.totalDefensePoints >= requiredDefense) {
        this.castleLevel++;
        console.log(`城堡自動升級成功！目前等級: ${this.castleLevel}，需要防禦力: ${requiredDefense}`);
        return true;
      } else {
        console.log(`防禦力不足！需要 ${requiredDefense} 防禦力才能升級，目前有 ${this.totalDefensePoints}`);
        return false;
      }
    },

    // 更新防禦點數並檢查是否可以升級城堡
    updateDefensePoints(newValue) {
      this.totalDefensePoints = newValue;
      // 檢查是否可以升級城堡
      this.checkCastleUpgrade();
    },

    // 檢查城堡是否可以升級
    checkCastleUpgrade() {
      const requiredDefense = (this.castleLevel + 1) * 150;
      if (this.totalDefensePoints >= requiredDefense) {
        this.upgradeCastle();
      }
    }
  }
});
