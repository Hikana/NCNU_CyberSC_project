<template>
  <div class="achievement-menu" v-if="isVisible">
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
            'completed': achievement.completed, 
            'claimed': achievement.claimed,
            'ready-to-claim': achievement.completed && !achievement.claimed
          }"
        >
          <div class="achievement-icon">
            {{ achievement.completed ? (achievement.claimed ? '✅' : '🎁') : '🔒' }}
          </div>
          <div class="achievement-info">
            <h3 class="achievement-title">{{ achievement.title }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="achievement.progress && !achievement.completed">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.round((achievement.progress.current / achievement.progress.total) * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ achievement.progress.current }}/{{ achievement.progress.total }}</span>
            </div>
          </div>
          <div class="achievement-actions">
            <div class="achievement-reward" v-if="achievement.reward">
              <span class="reward-text">獎勵: {{ achievement.reward }}</span>
            </div>
            <button 
              v-if="achievement.completed && !achievement.claimed" 
              @click="claimReward(achievement.id)"
              class="claim-btn"
            >
              領取獎勵
            </button>
            <div v-else-if="achievement.claimed" class="claimed-text">
              已領取
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// 成就數據
const achievements = ref([
  {
    id: 1,
    title: '初來乍到',
    description: '完成遊戲教學',
    completed: true,
    progress: {
      current: 1,
      total: 1
    },
    reward: '100 科技點',
    claimed: true
  },
  {
    id: 2,
    title: '建築大師',
    description: '建造 10 座建築',
    completed: false,
    progress: {
      current: 3,
      total: 10
    },
    reward: '500 科技點',
    claimed: false
  },
  {
    id: 3,
    title: '探索者',
    description: '探索 150 個未開發土地',
    completed: false,
    progress: {
      current: 45,
      total: 150
    },
    reward: '1000 科技點',
    claimed: false
  },
  {
    id: 4,
    title: '防禦專家',
    description: '建造 5 座防禦建築力達 100%',
    completed: false,
    progress: {
      current: 1,
      total: 5
    },
    reward: '800 科技點',
    claimed: false
  },
  {
    id: 5,
    title: '資源收集者',
    description: '收集 10 個資源',
    completed: true,
    progress: {
      current: 10,
      total: 10
    },
    reward: '200 科技點',
    claimed: false
  },
  {
    id: 6,
    title: '資安專家',
    description: '完成答題數 100 題',
    completed: false,
    progress: {
      current: 0,
      total: 100
    },
    reward: '300 科技點',
    claimed: false
  }
])

// 計算屬性
const completedCount = computed(() => {
  return achievements.value.filter(a => a.claimed).length // 只有已領取獎勵的才算完成
})

const totalCount = computed(() => {
  return achievements.value.length
})

const completionRate = computed(() => {
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 排序後的成就列表
const sortedAchievements = computed(() => {
  return [...achievements.value].sort((a, b) => {
    // 第一優先級：未完成的排在最後
    if (!a.completed && b.completed) return 1
    if (a.completed && !b.completed) return -1
    
    // 第二優先級：已完成的但未領取獎勵的排在最前面
    if (a.completed && !a.claimed && b.completed && b.claimed) return -1
    if (a.completed && a.claimed && b.completed && !b.claimed) return 1
    
    // 第三優先級：已領取獎勵的排在最後
    if (a.claimed && !b.claimed) return 1
    if (!a.claimed && b.claimed) return -1
    
    // 最後按 ID 排序
    return a.id - b.id
  })
})

// 領取獎勵功能
const claimReward = (achievementId) => {
  const achievement = achievements.value.find(a => a.id === achievementId);
  if (achievement) {
    achievement.claimed = true;
    
    // 顯示獎勵提示
    showRewardNotification(achievement.reward);
    
    // 可以觸發一個事件來更新玩家的資源
    // emit('rewardClaimed', { type: 'achievement', reward: achievement.reward });
  }
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
.achievement-menu {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.achievement-content {
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
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

.claim-btn {
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.claim-btn:hover {
  background-color: #218838;
}

.claimed-text {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.achievement-item.completed {
  border-color: #28a745;
  background: #f8fff9;
}

.achievement-item.ready-to-claim {
  border-color: #ffc107;
  background: #fffbf0;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
}

.achievement-item.claimed {
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
