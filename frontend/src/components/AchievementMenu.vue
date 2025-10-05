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
            'unlocked': achievement.status !== 'locked',
            'locked': achievement.status === 'locked'
          }"
        >
          <div class="achievement-icon">
            {{ achievement.status === 'locked' ? '🔒' : '🏆' }}
          </div>
          <div class="achievement-info">
            <h3 class="achievement-title">{{ achievement.name }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="achievement.status === 'locked'">
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
              <span class="reward-text"> {{ rewardText(achievement) }}</span>
            </div>
            <button v-if="achievement.status === 'unlocked'" class="claim-btn" @click="claimReward(achievement.id)">領取</button>
            <div v-else-if="achievement.status === 'finish'" class="unlocked-text">已領取</div>
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

// 檢查成就進度（成就已在 GamePage 初始化時載入）
onMounted(async () => {
  // 如果成就已經載入，只檢查是否有新的成就可以解鎖
  if (achievementStore.achievements.length > 0) {
    await achievementStore.checkAllAchievements()
  } else {
    // 如果成就還沒載入（備用方案），則載入成就
    await achievementStore.loadAchievements()
  }
})

const completedCount = computed(() => { // 已完成成就數
  return achievementStore.achievements.filter(a => a.status === 'finish').length
})

const totalCount = computed(() => { // 總成就數
  return achievementStore.achievements.length
})

const completionRate = computed(() => { // 完成率
  const total = achievementStore.achievements.length || 0
  if (!total) return 0
  const finished = achievementStore.achievements.filter(a => a.status === 'finish').length
  return Math.round((finished / total) * 100)
})

// 排序後的成就列表
const sortedAchievements = computed(() => {
  const rank = { unlocked: 0, locked: 1, finish: 2 }
  return [...achievementStore.achievements].sort((a, b) => {
    const ra = rank[a.status] ?? 99
    const rb = rank[b.status] ?? 99
    if (ra !== rb) return ra - rb
    // 同一狀態下，先依 maxProgress 由小到大（例如 1 題/第一座/第一個 會排一起）
    const am = a.maxProgress || (a.condition?.value ?? 1)
    const bm = b.maxProgress || (b.condition?.value ?? 1)
    if (am !== bm) return am - bm
    // 再依名稱穩定排序
    return String(a.name || a.id).localeCompare(String(b.name || b.id))
  })
})

// 領取獎勵：呼叫 store.claim 並顯示提示
const claimReward = (achievementId) => {
  const a = achievementStore.achievements.find(x => x.id === achievementId)
  if (!a || a.status !== 'unlocked') return
  achievementStore.claim(achievementId)
}

// 獎勵顯示文字
const rewardText = (a) => {
  const tech = a?.reward?.techPoints || 0
  const wall = a?.reward?.wallDefense || 0
  if (tech >= 0 && wall >= 0) return `+${tech} 💰、+${wall} 🛡️`
  return '—'
}
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

.claim-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.claim-btn:hover {
  background: #218838;
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
</style>

