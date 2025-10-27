<template>
  <section class="w-screen min-h-screen bg-bgg relative text-wordcolor">
    <!-- 動畫圓環容器 -->
    <div
      ref="animationContainer"
      class="absolute inset-0 flex items-center justify-center bg-bgg opacity-0 pointer-events-none z-20"
    >
      <svg
        class="w-full h-full"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 背景圓圈 -->
        <circle
          cx="500"
          cy="500"
          r="400"
          stroke="#464655"
          stroke-opacity="0.2"
          stroke-width="70"
          fill="none"
        />
        <!-- 動態圓環 -->
        <circle
          ref="progressCircle"
          cx="500"
          cy="500"
          r="400"
          stroke="#464655"
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
          fill="#464655"
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
      <div
        class="absolute inset-0 flex justify-center items-center pointer-events-none"
      >
        <span
          class="text-[20rem] md:text-[35rem] font-extrabold text-wordcolor opacity-5 select-none"
        >
          C I A
        </span>
      </div>

      <!-- 前景：左側文字 + 右側三要素 -->
      <div class="relative z-10 flex flex-col md:flex-row gap-10 w-full">
        <!-- 左側說明 -->
        <div class="md:w-1/2 flex flex-col justify-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6 md:mb-10 text-wordcolor">
            安全三要素 <span class="italic">CIA</span>
          </h2>
          <div class="text-lg md:text-xl leading-relaxed space-y-4">
            <h4 class="text-2xl font-semibold mb-2">CIA資訊安全三要素是常見的模型，</h4>
            <h4 class="text-2xl font-semibold mb-2">構成安全系統開發的基礎。</h4>
            <h4 class="text-2xl font-semibold mb-2">它們是用來尋找弱點和找出建立解決方案的方法。</h4>
          </div>
        </div>

        <!-- 右側項目列表 -->
        <div class="md:w-1/2 flex flex-col justify-center gap-6">
          <div
            v-for="(item, index) in ciaElements"
            :key="index"
            :class="{ 'border-b border-wordcolor pb-6': index !== ciaElements.length - 1 }"
          >
            <h3 class="font-semibold text-xl mb-2 text-wordcolor">
              {{ item.title }} {{ item.subtitle }}
            </h3>
            <h3 class="text-wordcolor text-xl ">
              {{ item.description }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, nextTick } from "vue"
import gsap from "gsap"

export default {
  name: "CIABar",
  setup(_, { emit }) {
    const countText = ref(null)
    const progressCircle = ref(null)
    const animationContainer = ref(null)
    const ciaSection = ref(null)

    // ✅ 移進這裡的 CIA 三要素
    const ciaElements = ref([
      {
        title: "Confidentiality",
        subtitle: "機密性",
        description:
          "僅授權的使用者才能存取資料，保護資訊不被未經授權者揭露或取得。",
      },
      {
        title: "Integrity",
        subtitle: "完整性",
        description:
          "確保資料未經授權不得修改，且修改必須透過授權機制進行。",
      },
      {
        title: "Availability",
        subtitle: "可用性",
        description:
          "確保合法使用者在需要時能夠存取系統與資訊，防止資源被拒絕使用。",
      },
    ])

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
        onComplete: () => {
          emit("ciaFinished")
        },
      })

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animationContainer.value.style.opacity = "1"
              animationContainer.value.classList.remove("pointer-events-none")
              tl.play()
              observer.unobserve(animationContainer.value)
            }
          })
        },
        { threshold: 0.9 }
      )

      observer.observe(animationContainer.value)
    }

    onMounted(async () => {
      await nextTick() // ✅ 確保 DOM 都載入完成再跑動畫
      CIAanimation()
    })

    return {
      countText,
      progressCircle,
      animationContainer,
      ciaSection,
      ciaElements, // ✅ return 出來給模板用
    }
  },
}
</script>
