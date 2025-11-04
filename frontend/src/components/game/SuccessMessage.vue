<template>
  <transition name="slide-up">
    <div v-if="visible" class="success-message-overlay" @click="close">
      <div class="success-message" @click.stop>
        <div class="success-icon">✅</div>
        <h3 class="success-title">成功處理事件！</h3>
        <p class="success-text">{{ message }}</p>
        <button class="success-btn" @click="close">確定</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(props.show)

watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal) {
    // 3秒後自動關閉
    setTimeout(() => {
      close()
    }, 3000)
  }
})

function close() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.success-message-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.success-message {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: scale-in 0.3s ease;
}

@keyframes scale-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.success-text {
  font-size: 16px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 30px 0;
}

.success-btn {
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.success-btn:hover {
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
