<template>
  <div
    ref="sectionRef"
    class="flex w-full h-screen items-center justify-center bg-bgg overflow-hidden relative"
  >
    <!-- 左邊字幕 -->
    <div class="w-1/2 flex flex-col justify-center items-start px-48">
      <p
        v-for="(line, index) in visibleLines"
        :key="index"
        class="text-2xl md:text-3xl font-semibold text-gray-700 mb-4"
        :class="{ 'typing-active': index === currentTypingIndex }"
      >
        {{ line }}
      </p>
    </div>

    <!-- 右邊 GIF -->
    <div
      class="w-1/2 flex justify-center items-center transition-transform duration-300"
      :style="{
        transform: `translateX(${gifOffset}px)`,
        opacity: gifOpacity,
      }"
    >
      <img
        :src="currentGif"
        alt="section animation"
        class="w-3/4 h-auto object-contain transition-opacity duration-700"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  lines: { type: Array, default: () => ["Hello, world!"] },
  gif1: { type: String, default: "/src/assets/image/Menu/menu.gif" },
  gif2: { type: String, default: "/src/assets/image/Menu/menu2.gif" },
});

const sectionRef = ref(null);
const visibleLines = ref([]);
const currentTypingIndex = ref(-1);
const hasPlayed = ref(false);

const currentGif = ref(props.gif1);
const gifOffset = ref(0);
const gifOpacity = ref(1);

let observer;
let isScrollLocked = false;
let menu2Active = false;

const lockScroll = () => {
  if (!isScrollLocked) {
    document.body.style.overflow = "hidden";
    isScrollLocked = true;
  }
};
const unlockScroll = () => {
  document.body.style.overflow = "";
  isScrollLocked = false;
};

const startAnimation = () => {
  if (hasPlayed.value) return;
  hasPlayed.value = true;
  lockScroll();

  let index = 0;
  const interval = setInterval(() => {
    if (index < props.lines.length) {
      visibleLines.value.push(props.lines[index]);
      currentTypingIndex.value = index;
      index++;
      setTimeout(() => (currentTypingIndex.value = -1), 1000);
    } else {
      clearInterval(interval);
      unlockScroll();

      setTimeout(() => {
        currentGif.value = props.gif2;
        menu2Active = true;
      }, 500);
    }
  }, 1500);
};

const handleWheel = (e) => {
  if (!menu2Active) return;
  if (e.deltaY > 0) gifOffset.value -= 125;
};

const handleIntersection = (entries) => {
  entries.forEach((entry) => {
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
  window.addEventListener("wheel", handleWheel);
});
onUnmounted(() => {
  if (observer && sectionRef.value) observer.unobserve(sectionRef.value);
  unlockScroll();
  window.removeEventListener("wheel", handleWheel);
});
</script>

<style scoped>
p {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid transparent;
}
.typing-active {
  border-right: 2px solid #777;
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
