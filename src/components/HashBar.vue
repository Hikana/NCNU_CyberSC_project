<template>
  <section
    class="w-screen h-screen bg-bggray text-wordcolor flex flex-col justify-center items-center relative z-10"
  >
    <!-- 背景 HASH 字 -->
    <div
      class="absolute inset-0 flex justify-center items-center pointer-events-none"
    >
      <span
        ref="hashText"
        class="font-extrabold text-wordcolor opacity-5 select-none hacker-text tracking-wider transition-all duration-100"
        :class="getTextSizeClass(displayText)"
      >
        {{ displayText }}
      </span>
    </div>

    <!-- HASH 說明內容 -->
    <div
      ref="hashContent"
      class="absolute inset-0 opacity-0 pointer-events-none flex flex-col md:flex-row gap-10 p-8 md:p-16 transition-opacity duration-1000 z-10"
    >
      <!-- 左欄 -->
      <div class="flex-1 z-10">
        <h2 class="text-3xl md:text-5xl font-bold mb-6">
          雜湊 <em>Hash Function</em>
        </h2>
        <div class="text-lg md:text-xl leading-relaxed">
          <p class="mb-2">
            雜湊是一種對資料的處理方法，透過一連串的演算，
          </p>
          <p>將資料轉換成看似亂碼的字串。</p>
        </div>
      </div>

      <!-- 右欄 -->
      <div class="flex-1 z-10">
        <div class="mb-8">
          <h3 class="text-2xl font-semibold mb-4">特性：</h3>
          <ul
            class="list-disc pl-6 space-y-2 text-lg md:text-xl leading-relaxed"
          >
            <li><strong>一致性：</strong>相同輸入，雜湊值相同</li>
            <li><strong>不可逆：</strong>無法從雜湊值反推出原始內容</li>
            <li><strong>抗碰撞：</strong>難以找出兩個不同資料產生相同雜湊值</li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold mb-4">常見的雜湊演算法：</h3>
          <div
            class="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl italic"
          >
            <span>SHA-0</span>
            <span>SHA-1（不安全）</span>
            <span>SHA-256</span>
            <span>RIPEMD-160</span>
            <span>MD-5（不安全）</span>
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
  name: "HashBar",
  setup() {
    const hashText = ref(null)
    const hashContent = ref(null)

    const displayText = ref("HASH")
    const originalText = "HASH"
    const hackerChars = ["AAAAAAA", "hUanGzIEn", "HIOsguIH"]

    let isGlitching = false
    let glitchTimeout = null
    let resetTimeout = null
    let hasPlayed = false

    const getTextSizeClass = (text) => {
      switch (text) {
        case "AAAAAAA":
        case "hUanGzIEn":
        case "HIOsguIH":
          return "text-[15rem]"
        case "HASH":
        default:
          return "text-[28rem]"
      }
    }

    const getRandomHackerText = () => {
      return hackerChars[Math.floor(Math.random() * hackerChars.length)]
    }

    const startHackerEffect = () => {
      if (isGlitching) return
      isGlitching = true
      let iterations = 0
      const maxIterations = 15
      if (resetTimeout) clearTimeout(resetTimeout)

      const glitchInterval = setInterval(() => {
        displayText.value = getRandomHackerText()

        gsap.to(hashText.value, {
          duration: 0.1,
          scaleX: 0.95 + Math.random() * 0.1,
          scaleY: 0.95 + Math.random() * 0.1,
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          opacity: 0.05 + Math.random() * 0.15,
          ease: "power2.out",
        })

        iterations++
        if (iterations >= maxIterations) {
          clearInterval(glitchInterval)
          displayText.value = originalText
          gsap.to(hashText.value, {
            duration: 0.5,
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
            opacity: 0.05,
            ease: "power2.out",
          })
          gsap.to(hashContent.value, {
            duration: 1,
            opacity: 1,
            onStart: () => {
              hashContent.value.classList.remove("pointer-events-none")
            },
          })
          isGlitching = false
        }
      }, 150)
    }

    onMounted(() => {
      observeHashSection()
      gsap.from(hashText.value, {
        duration: 1,
        opacity: 0,
        scale: 0.5,
        ease: "power2.inOut",
      })
    })

    onUnmounted(() => {
      if (glitchTimeout) clearTimeout(glitchTimeout)
      if (resetTimeout) clearTimeout(resetTimeout)
    })

    function observeHashSection() {
      const section = hashText.value?.closest("section")
      if (!section) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasPlayed) {
              hasPlayed = true
              startHackerEffect()
              observer.unobserve(section)
            }
          })
        },
        { threshold: 0.9 }
      )
      observer.observe(section)
    }

    return { hashText, hashContent, displayText, getTextSizeClass }
  },
}
</script>
