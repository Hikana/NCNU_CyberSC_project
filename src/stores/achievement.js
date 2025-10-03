import { defineStore } from 'pinia';
import { usePlayerStore } from './player';
import { useBuildingStore } from './buildings';

export const useAchievementStore = defineStore('achievement', {
  state: () => ({
    achievements: [
      // 答題相關成就
      {
        id: 'first_question',
        name: '初學者',
        description: '答對第一題',
        reward: '50 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: 'question_master',
        name: '答題大師',
        description: '答對10題',
        reward: '200 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: 'question_expert',
        name: '答題專家',
        description: '答對50題',
        reward: '500 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
      },
      
      // 建築相關成就
      {
        id: 'first_building',
        name: '建築新手',
        description: '建造第一座建築',
        reward: '100 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: 'building_master',
        name: '建築大師',
        description: '建造10座建築',
        reward: '300 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: 'city_builder',
        name: '城市建造者',
        description: '建造20座建築',
        reward: '600 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 20,
      },
      
      // 土地開發相關成就
      {
        id: 'land_explorer',
        name: '土地探索者',
        description: '開發5塊土地',
        reward: '150 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
      },
      {
        id: 'land_developer',
        name: '土地開發商',
        description: '開發15塊土地',
        reward: '400 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 15,
      },
      {
        id: 'land_tycoon',
        name: '土地大亨',
        description: '開發25塊土地',
        reward: '800 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 25,
      },
      
      // 綜合成就
      {
        id: 'balanced_player',
        name: '平衡發展',
        description: '答對20題且建造15座建築',
        reward: '1000 科技點',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
      }
    ],
    
    // 統計數據
    stats: {
      totalQuestionsAnswered: 0,
      totalBuildingsBuilt: 0,
      totalLandsDeveloped: 0
    }
  }),

  getters: {
    // 已解鎖的成就
    unlockedAchievements: (state) => {
      return state.achievements.filter(achievement => achievement.unlocked);
    },
    
    // 未解鎖的成就
    lockedAchievements: (state) => {
      return state.achievements.filter(achievement => !achievement.unlocked);
    },
    
    // 按獎勵類型分組的成就
    achievementsByReward: (state) => {
      const grouped = {};
      state.achievements.forEach(achievement => {
        const rewardType = achievement.reward.includes('科技點') ? '科技點' : '其他';
        if (!grouped[rewardType]) {
          grouped[rewardType] = [];
        }
        grouped[rewardType].push(achievement);
      });
      return grouped;
    },
    
    // 總成就進度
    totalProgress: (state) => {
      const unlocked = state.achievements.filter(a => a.unlocked).length;
      return Math.round((unlocked / state.achievements.length) * 100);
    }
  },

  actions: {
    // 檢查答題相關成就
    checkQuestionAchievements() {
      const playerStore = usePlayerStore();
      const questionCount = playerStore.correctlyAnsweredCount;
      
      // 更新統計
      this.stats.totalQuestionsAnswered = questionCount;
      
      // 檢查各項成就
      this.achievements.forEach(achievement => {
        if (achievement.description.includes('答對') && !achievement.unlocked) {
          achievement.progress = questionCount;
          
          if (questionCount >= achievement.maxProgress) {
            this.unlockAchievement(achievement.id);
          }
        }
      });
    },
    
    // 檢查建築相關成就
    checkBuildingAchievements() {
      const buildingStore = useBuildingStore();
      
      // 計算已建造的建築數量（從地圖數據）
      let buildingCount = 0;
      buildingStore.map.forEach(row => {
        row.forEach(tile => {
          if (tile.type === 'building') {
            buildingCount++;
          }
        });
      });
      
      // 更新統計
      this.stats.totalBuildingsBuilt = buildingCount;
      
      // 檢查各項成就
      this.achievements.forEach(achievement => {
        if (achievement.description.includes('建造') && !achievement.unlocked) {
          achievement.progress = buildingCount;
          
          if (buildingCount >= achievement.maxProgress) {
            this.unlockAchievement(achievement.id);
          }
        }
      });
    },
    
    // 檢查土地開發相關成就
    checkLandAchievements() {
      const buildingStore = useBuildingStore();
      
      // 計算已開發的土地數量（有建築或特殊標記的土地）
      let landCount = 0;
      buildingStore.map.forEach(row => {
        row.forEach(tile => {
          if (tile.type === 'building' || tile.type === 'developed') {
            landCount++;
          }
        });
      });
      
      // 更新統計
      this.stats.totalLandsDeveloped = landCount;
      
      // 檢查各項成就
      this.achievements.forEach(achievement => {
        if (achievement.description.includes('開發') && !achievement.unlocked) {
          achievement.progress = landCount;
          
          if (landCount >= achievement.maxProgress) {
            this.unlockAchievement(achievement.id);
          }
        }
      });
    },
    
    // 檢查綜合成就
    checkMixedAchievements() {
      this.achievements.forEach(achievement => {
        if (achievement.description.includes('平衡發展') && !achievement.unlocked) {
          // 平衡發展成就：答對20題且建造15座建築
          if (achievement.id === 'balanced_player') {
            const questionCondition = this.stats.totalQuestionsAnswered >= 20;
            const buildingCondition = this.stats.totalBuildingsBuilt >= 15;
            
            if (questionCondition && buildingCondition) {
              achievement.progress = 1;
              this.unlockAchievement(achievement.id);
            }
          }
        }
      });
    },
    
    // 解鎖成就
    unlockAchievement(achievementId) {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.progress = achievement.maxProgress;
        
        console.log(`🎉 成就解鎖：${achievement.name} - ${achievement.description}`);
        
        // 可以在這裡加入成就解鎖的動畫或音效
        this.showAchievementNotification(achievement);
      }
    },
    
    // 顯示成就通知
    showAchievementNotification(achievement) {
      // 這裡可以觸發一個全域的通知系統
      // 或者 emit 事件給父元件處理
      console.log(`🏆 新成就：${achievement.name}`);
    },
    
    // 檢查所有成就（通常在遊戲狀態更新後呼叫）
    checkAllAchievements() {
      this.checkQuestionAchievements();
      this.checkBuildingAchievements();
      this.checkLandAchievements();
      this.checkMixedAchievements();
    },
    
    // 重置所有成就（用於測試或新遊戲）
    resetAllAchievements() {
      this.achievements.forEach(achievement => {
        achievement.unlocked = false;
        achievement.progress = 0;
      });
      
      this.stats = {
        totalQuestionsAnswered: 0,
        totalBuildingsBuilt: 0,
        totalLandsDeveloped: 0
      };
    }
  }
});
