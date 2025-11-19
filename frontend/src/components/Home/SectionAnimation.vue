<template>
  <div
    ref="sectionRef"
    class="flex w-full min-h-screen items-center justify-center bg-bgg overflow-hidden relative px-6"
  >
    <div class="max-w-5xl w-full flex flex-col justify-center items-start md:items-center gap-4 text-center">
      <p
        v-for="(line, index) in visibleLines"
        :key="index"
        class="text-2xl md:text-3xl font-semibold text-wordcolor"
        :class="{ 'typing-active': index === currentTypingIndex }"
      >
        {{ line }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  lines: { type: Array, default: () => ["Hello, world!"] },
});

const sectionRef = ref(null);
const visibleLines = ref([]);
const currentTypingIndex = ref(-1);
const hasPlayed = ref(false);

let observer;

const startAnimation = () => {
  if (hasPlayed.value) return;
  hasPlayed.value = true;

  let index = 0;
  const interval = setInterval(() => {
    if (index < props.lines.length) {
      visibleLines.value.push(props.lines[index]);
      currentTypingIndex.value = index;
      index++;
      setTimeout(() => (currentTypingIndex.value = -1), 1000);
    } else {
      clearInterval(interval);
    }
  }, 1500);
};

const handleIntersection = (entries) => {
  entries.forEach((entry) => {
    // 這裡的邏輯是當區塊進入可視範圍 90% 時觸發動畫
    if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
      startAnimation();
    }
  });
};

onMounted(() => {
  observer = new IntersectionObserver(handleIntersection, {
    threshold: Array.from({ length: 11 }, (_, i) => i / 10),
  });
  if (sectionRef.value) observer.observe(sectionRef.value);
});

onUnmounted(() => {
  if (observer && sectionRef.value) observer.unobserve(sectionRef.value);
});
</script>

<style scoped>
p {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid transparent;
}
.typing-active {
  border-right: 2px solid #AB78BE;
  animation: typing 1s steps(30, end), blink 0.75s step-end infinite;
}
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
@keyframes blink {
  50% {
    border-color: transparent;
  }
}
</style>