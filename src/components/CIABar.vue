<template>
    <section class="w-screen min-h-screen bg-bggray relative">
      <!-- 動畫圓環容器 -->
      <div
        ref="animationContainer"
        class="absolute inset-0 flex items-center justify-center bg-bggray opacity-0 pointer-events-none z-20"
      >
        <svg class="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <!-- 背景圓圈 -->
          <circle cx="500" cy="500" r="400" stroke="#504B4B" stroke-opacity="0.2" stroke-width="70" fill="none" />
          <!-- 動態圓環 -->
          <circle
            ref="progressCircle"
            cx="500"
            cy="500"
            r="400"
            stroke="#504B4B"
            stroke-width="70"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="2827.43"
            stroke-dashoffset="0"
            transform="rotate(-90 500 500)"
          />
          <!-- 中央字母顯示 C、I、A -->
          <text
            ref="countText"
            x="50%"
            y="50%"
            text-anchor="middle"
            dy=".35em"
            fill="#504B4B"
            class="text-[200px] md:text-[300px] font-extrabold select-none"
          ></text>
        </svg>
      </div>

      <!-- CIA 說明內容 -->
      <div
        ref="ciaSection"
        class="absolute inset-0 opacity-0 pointer-events-none flex flex-col md:flex-row gap-10 p-8 md:p-16 transition-opacity duration-1000 z-10"
      >
        <!-- 背景大型文字 CIA -->
        <div class="absolute inset-0 flex justify-center items-center pointer-events-none">
          <span class="text-[20rem] md:text-[35rem] font-extrabold text-wordcolor opacity-5 select-none">C I A</span>
        </div>

        <!-- 前景：左側文字 + 右側三要素 -->
        <div class="relative z-10 flex flex-col md:flex-row gap-10 w-full">
          <!-- 左側說明 -->
          <div class="md:w-1/2 flex flex-col justify-center">
            <h3 class="text-3xl md:text-5xl font-bold mb-6 md:mb-10 text-wordcolor">
              安全三要素 <span class="italic">CIA</span>
            </h3>
            <div class="text-base md:text-lg text-wordcolor space-y-3">
              <p>CIA資訊安全三要素是常見的模型，</p>
              <p>構成安全系統開發的基礎。</p>
              <p>它們是用來尋找弱點和找出建立解決方案的方法。</p>
            </div>
          </div>

          <!-- 右側項目列表 -->
          <div class="md:w-1/2 flex flex-col justify-center gap-6">
            <div
              v-for="(item, index) in ciaElements"
              :key="index"
              :class="{ 'border-b border-gray-300 pb-6': index !== ciaElements.length - 1 }"
            >
              <h4 class="italic font-semibold text-lg md:text-xl mb-2 text-wordcolor">
                {{ item.title }} {{ item.subtitle }}
              </h4>
              <p class="text-wordcolor text-sm md:text-base">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>
<script>
import { ref, onMounted, onUnmounted } from "vue"
import gsap from "gsap"

export default {
  name: "CIABar",
  props: {
    ciaElements: Array
  },
  setup() {
    const countText = ref(null)
    const progressCircle = ref(null)
    const animationContainer = ref(null)
    const ciaSection = ref(null)

    const sequence = ["C", "I", "A"]

    function CIAanimation() {
      const circumference = 2 * Math.PI * 500
      const tl = gsap.timeline({ paused: true })

      sequence.forEach((text) => {
        tl.set(countText.value, { textContent: text })
        tl.fromTo(
          progressCircle.value,
          { strokeDashoffset: 0 },
          { strokeDashoffset: circumference, duration: 1, ease: "linear" }
        )
      })

      tl.to(animationContainer.value, {
        opacity: 0,
        duration: 1.5,
        onComplete: () => {
          animationContainer.value.classList.add("pointer-events-none")
        },
      })
      tl.to(ciaSection.value, {
        opacity: 1,
        duration: 1,
        onStart: () => {
          ciaSection.value.classList.remove("pointer-events-none")
        },
      })

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationContainer.value.style.opacity = "1"
            animationContainer.value.classList.remove("pointer-events-none")
            tl.play()
            observer.unobserve(animationContainer.value)
          }
        })
      }, { threshold: 0.9 })

      observer.observe(animationContainer.value)
    }

    onMounted(() => {
      CIAanimation()
    })

    return {
      countText,
      progressCircle,
      animationContainer,
      ciaSection
    }
  }
}
</script>
