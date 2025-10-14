const playerData = require('../models/playerData');

class PlayerService {
  // 取得玩家資料
  async getPlayer(userId) {
    return playerData.getPlayer(userId);
  }

  // 更新玩家科技點
  async updateTechPoints(userId, techPoints) {
    return playerData.updatePlayer(userId, { techPoints });
  }

  // 更新玩家防禦值
  async updateDefense(userId, defense) {
    return playerData.updatePlayer(userId, { defense });
  }

  // 更新玩家城堡等級
  async updateCastleLevel(userId, castleLevel) {
    return playerData.updatePlayer(userId, { castleLevel });
  }

  async getInventory(userId) {
    return playerData.getInventory(userId);
  }
  async setInventory(userId, items) {
    return playerData.setInventory(userId, items);
  }

  // --- 成就系統方法 ---
  
  // 取得所有成就
  async getAchievements() {
    return playerData.getAchievements();
  }

  // 取得玩家成就進度（合併全域成就和玩家進度）
  async getPlayerAchievements(userId) {
    // 1. 取得所有成就
    const allAchievements = await playerData.getAchievements();
    
    // 2. 取得玩家成就進度
    const playerProgress = await playerData.getPlayerAchievements(userId);
    
    // 3. 合併資料
    const playerProgressMap = {};
    playerProgress.forEach(progress => {
      playerProgressMap[progress.id] = progress;
    });

    return allAchievements.map(achievement => ({
      ...achievement,
      status: playerProgressMap[achievement.id]?.status || 'locked',
      progress: playerProgressMap[achievement.id]?.progress || 0,
      claimedAt: playerProgressMap[achievement.id]?.claimedAt || null
    }));
  }

  // 更新玩家成就狀態
  async updatePlayerAchievement(userId, achievementId, updateData) {
    return playerData.updatePlayerAchievement(userId, achievementId, updateData);
  }

  // 檢查並更新成就進度
  async checkAchievements(userId, gameStats) {
    const { answeredCount, itemCount, developedCount, eventCount } = gameStats;
    
    // 1. 取得玩家當前成就進度
    const playerAchievements = await this.getPlayerAchievements(userId);
    
    // 2. 檢查每個成就的條件
    const updatedAchievements = playerAchievements.map(achievement => {
      const originalStatus = achievement.status; // 保存原始狀態
      const { field, value } = achievement.condition || { field: 'answeredCount', value: achievement.maxProgress || 1 };
      const target = value || achievement.maxProgress || 1;
      
      const current = field === 'answeredCount' ? answeredCount
                    : field === 'itemCount' ? itemCount
                    : field === 'developedCount' ? developedCount
                    : field === 'eventCount' ? eventCount
                    : 0;
      
      const progress = Math.min(current, achievement.maxProgress || target);
      const willUnlock = current >= target;
      
      // 若已 finished，保持 finished；未達成 -> locked；達成 -> unlocked（等待手動領取）
      const nextStatus = originalStatus === 'finish' ? 'finish' : (willUnlock ? 'unlocked' : 'locked');
      
      return { ...achievement, progress, status: nextStatus, _originalStatus: originalStatus };
    });

    // 3. 更新資料庫中的進度（只有狀態真正改變時才更新）
    for (const achievement of updatedAchievements) {
      if (achievement.status !== achievement._originalStatus) {
        console.log(`🔄 成就狀態改變: ${achievement.id} ${achievement._originalStatus} -> ${achievement.status}`);
        await this.updatePlayerAchievement(userId, achievement.id, {
          status: achievement.status,
          progress: achievement.progress
        });
      }
    }

    // 4. 移除臨時欄位
    return updatedAchievements.map(a => {
      const { _originalStatus, ...cleanAchievement } = a;
      return cleanAchievement;
    });
  }
}

module.exports = new PlayerService();


