import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService';
import { usePlayerStore } from './player';
import { useBuildingStore } from './buildings';


export const useAchievementStore = defineStore('achievement', {
  state: () => ({
    achievements: [],
    loading: false,
    error: null,
  }),

  getters: {
    unlockedAchievements: (state) => state.achievements.filter(a => a.status === 'unlocked' || a.status === 'finish'),
    lockedAchievements: (state) => state.achievements.filter(a => a.status === 'locked'),
    totalProgress: (state) => {
      if (!state.achievements.length) return 0;
      const unlocked = state.achievements.filter(a => a.status !== 'locked').length;
      return Math.round((unlocked / state.achievements.length) * 100);
    }
  },

  actions: {
    async loadAchievements() {
      this.loading = true; 
      this.error = null;
      try {
        const playerStore = usePlayerStore();
        const uid = playerStore.userId || playerStore.initFromAuth();
        if (!uid) {
          console.warn('⚠️ 尚未登入，無法載入成就資料');
          return;
        }
        
        // 透過 API 取得玩家成就進度（已包含全域成就和玩家進度的合併）
        const achievements = await apiService.getPlayerAchievements(uid);
        this.achievements = achievements.map(a => ({ ...a, _applied: false }));
      } catch (e) {
        console.error('載入成就失敗:', e);
        this.error = e?.message || String(e);
      } finally {
        this.loading = false;
      }
    },

    async checkAllAchievements() {
      const playerStore = usePlayerStore();
      const buildingStore = useBuildingStore();

      const answeredCount = playerStore.correctlyAnsweredCount || 0;

      let itemCount = 0;
      if (Array.isArray(buildingStore.map) && buildingStore.map.length) {
        buildingStore.map.forEach(row => {
          row.forEach(cell => {
            if (!cell) return;
            if (cell.status === 'placed') itemCount++;
          });
        });
      }

      const eventCount = playerStore.eventResolvedCount || 0;
      const connectToSwitchCount = playerStore.connectToSwitchCount || 0;
      const connectToRouterCount = playerStore.connectToRouterCount || 0;
      const connectToInternetTowerCount = playerStore.connectToInternetTowerCount || 0;
      const castleLevel = playerStore.castleLevel || 0;

      // 統計已放置的 switch 和 router 數量
      let switchCount = 0;
      let routerCount = 0;
      if (Array.isArray(buildingStore.map) && buildingStore.map.length) {
        buildingStore.map.forEach(row => {
          row.forEach(cell => {
            if (!cell || cell.status !== 'placed') return;
            if (cell.type === 'switch') switchCount++;
            else if (cell.type === 'router') routerCount++;
          });
        });
      }

      const gameStats = { answeredCount, itemCount, eventCount, connectToSwitchCount, connectToRouterCount, connectToInternetTowerCount, switchCount, routerCount, castleLevel };
      
      try {
        const uid = playerStore.userId || playerStore.initFromAuth();
        if (!uid) {
          console.warn('⚠️ 尚未登入，無法載入成就資料');
          return;
        }
        // 透過 API 檢查並更新成就進度
        const updatedAchievements = await apiService.checkAchievements(uid, gameStats);
        this.achievements = updatedAchievements.map(a => ({ ...a, _applied: false }));
      } catch (e) {
        console.error('檢查成就失敗:', e);
        // 如果 API 失敗，仍使用本地計算作為備用
        this.achievements = this.achievements.map(a => {
          const { field, value } = a.condition || { field: 'answeredCount', value: a.maxProgress || 1 };
          
          
          const target = value || a.maxProgress || 1;
          const current = field === 'answeredCount' ? answeredCount
                        : field === 'itemCount' ? itemCount
                        : field === 'eventCount' ? eventCount
                        : field === 'connectToSwitchCount' ? connectToSwitchCount
                        : field === 'connectToRouterCount' ? connectToRouterCount
                        : field === 'connectToInternetTowerCount' ? connectToInternetTowerCount
                        : field === 'switchCount' ? switchCount
                        : field === 'routerCount' ? routerCount
                        : field === 'castleLevel' ? castleLevel
                        : 0;
          const progress = Math.min(current, a.maxProgress || target);
          const willUnlock = current >= target;
          
          // 等級類型成就：如果曾經達到過（unlocked 或 finish），就保持狀態不變（里程碑式成就）
          if (field === 'castleLevel') {
            if (a.status === 'finish' || a.status === 'unlocked') {
              // 曾經達到過，保持原狀態（里程碑式成就，不會因為等級下降而失去）
              return { ...a, progress: Math.max(progress, a.progress || 0), status: a.status };
            }
          }
          
          const nextStatus = a.status === 'finish' ? 'finish' : (willUnlock ? 'unlocked' : 'locked');
          return { ...a, progress, status: nextStatus };
        });
      }
    },

    async claim(achievementId) {
      const a = this.achievements.find(x => x.id === achievementId);
      if (!a || a.status !== 'unlocked') return;
      
      // 先應用獎勵（等待完成）
      await this.applyReward(a);
      
      // 播放成就獲得音效
      try {
        const { audioService } = await import('@/services/audioService');
        await audioService.playAchievementSuccessSound();
      } catch (error) {
        console.warn('播放成就音效失敗:', error);
      }
      
      // 透過 API 更新玩家成就狀態
      const playerStore = usePlayerStore();
      const uid = playerStore.userId || playerStore.initFromAuth();
      if (!uid) {
        console.warn('⚠️ 尚未登入，無法更新成就');
        return;
      }
      
      try {
        console.log('🔄 正在更新成就狀態到資料庫:', achievementId, 'status: finish');
        const result = await apiService.updatePlayerAchievement(uid, achievementId, {
          status: 'finish',
          progress: a.maxProgress || a.condition?.value || 1
        });
        console.log('✅ 成就狀態已更新到資料庫:', result);
        
        // 更新本地狀態
        const idx = this.achievements.findIndex(achievement => achievement.id === achievementId);
        if (idx >= 0) {
          this.achievements[idx] = { ...this.achievements[idx], status: 'finish' };
        }
      } catch (err) {
        console.error('❌ 同步玩家成就狀態失敗:', err);
      }
    },

    async applyReward(achievement) { 
      const playerStore = usePlayerStore();
      const tech = achievement?.reward?.techPoints || 0;
      const wall = achievement?.reward?.wallDefense || 0;

      if (tech > 0) await playerStore.addTechPoints(tech);
      if (wall > 0) {
        const newDefense = playerStore.defense + wall;
        await playerStore.updateDefense(newDefense);
      }

      const idx = this.achievements.findIndex(a => a.id === achievement.id);
      if (idx >= 0) this.achievements[idx] = { ...this.achievements[idx], status: 'finish' };

      console.log(`🏆 成就兌換：${achievement.name} (+${tech} 科技點, +${wall} 防禦)`);
    },

    resetLocal() { 
      this.achievements = this.achievements.map(a => ({ ...a, status: 'locked', progress: 0, _applied: false }));
    }
  }
});
