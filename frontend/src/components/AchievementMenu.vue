<template>
  <div class="achievement-menu" v-if="isVisible">
    <h2 class="page-title">🎉 成就列表</h2>
    <div class="achievement-content">
      <!-- 成就統計 -->
      <div class="achievement-stats">
        <div class="stat-item">
          <span class="stat-label">已完成成就</span>
          <span class="stat-value">{{ completedCount }}/{{ totalCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">完成率</span>
          <span class="stat-value">{{ completionRate }}%</span>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="achievement-list">
        <div 
          v-for="achievement in sortedAchievements" 
          :key="achievement.id"
          class="achievement-item"
          :class="{ 
            'unlocked': achievement.unlocked,
            'locked': !achievement.unlocked
          }"
        >
          <div class="achievement-icon">
            {{ achievement.unlocked ? '🏆' : '🔒' }}
          </div>
          <div class="achievement-info">
            <h3 class="achievement-title">{{ achievement.name }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="!achievement.unlocked">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.round((achievement.progress / achievement.maxProgress) * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ achievement.progress }}/{{ achievement.maxProgress }}</span>
            </div>
          </div>
          <div class="achievement-actions">
            <div class="achievement-reward">
              <span class="reward-text">💰 {{ achievement.reward }}</span>
            </div>
            <div v-if="achievement.unlocked" class="unlocked-text">
              已解鎖
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievement'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// 使用成就 store
const achievementStore = useAchievementStore()

// 在元件掛載時檢查成就
onMounted(() => {
  achievementStore.checkAllAchievements()
})

// 計算屬性
const completedCount = computed(() => {
  return achievementStore.unlockedAchievements.length
})

const totalCount = computed(() => {
  return achievementStore.achievements.length
})

const completionRate = computed(() => {
  return achievementStore.totalProgress
})

// 排序後的成就列表
const sortedAchievements = computed(() => {
  return [...achievementStore.achievements].sort((a, b) => {
    // 第一優先級：已解鎖的排在前面
    if (!a.unlocked && b.unlocked) return 1
    if (a.unlocked && !b.unlocked) return -1
    
    // 第二優先級：按進度排序
    const aProgress = a.progress / a.maxProgress
    const bProgress = b.progress / b.maxProgress
    return bProgress - aProgress
  })
})

// 領取獎勵功能（簡化版，因為 store 中沒有獎勵系統）
const claimReward = (achievementId) => {
  // 這裡可以加入獎勵邏輯，比如給玩家科技點
  console.log(`成就 ${achievementId} 獎勵已領取`);
};



// 顯示獎勵提示
const showRewardNotification = (reward) => { 
  // 創建一個臨時的獎勵提示元素
  const notification = document.createElement('div');
  notification.className = 'reward-notification';
  notification.innerHTML = `
    <div class="reward-notification-content">
      <span class="reward-icon">🎉</span>
      <span class="reward-text">獲得獎勵: ${reward}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 添加動畫類
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // 自動移除
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
};
</script>

<style scoped>
.page-title {
  margin: 0px 0px 10px 0px;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
  align-self: flex-start;
}

.achievement-menu {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.achievement-content {
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: scroll; /* 改為 scroll 強制顯示滾動條 */
  box-sizing: border-box;
}

.achievement-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  justify-content: space-around;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.achievement-icon {
  font-size: 24px;
  margin-right: 16px;
  min-width: 32px;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.achievement-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

.achievement-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 16px;
}

.achievement-reward {
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  min-width: 80px;
  text-align: center;
}

.reward-text { 
  font-size: 12px;
  color: #856404;
  font-weight: 500;
}

.unlocked-text {
  font-size: 12px;
  color: #28a745;
  font-weight: 500;
}

.achievement-item.unlocked {
  border-color: #28a745;
  background: #f8fff9;
}

.achievement-item.locked {
  border-color: #6c757d;
  background: #f0f0f0;
  opacity: 0.8;
}

/* 獎勵提示樣式 */
.reward-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  transform: translateX(400px);
  transition: transform 0.3s ease;
}

.reward-notification.show {
  transform: translateX(0);
}

.reward-notification-content {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(40, 167, 69, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
}

.reward-icon {
  font-size: 24px;
  animation: bounce 0.6s ease-in-out;
}

.reward-text {
  font-size: 14px;
  font-weight: 600;
}

@keyframes bounce { 
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .achievement-content {
    margin: 20px;
    max-width: calc(100% - 40px);
  }
  
  .achievement-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .achievement-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .achievement-reward {
    margin-left: 0;
    align-self: stretch;
  }
}
</style>

