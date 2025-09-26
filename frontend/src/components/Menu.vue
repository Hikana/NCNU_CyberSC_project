<template>
  <div
    v-show="showMenu"
    class="fixed bottom-6 right-6 z-50 transition-opacity duration-500"
    :class="showMenu ? 'opacity-100' : 'opacity-0'"
    style="transform: scale(calc(100vw / 1920)); transform-origin: bottom right;"
  >
    <!-- 整個路標組 -->
    <div class="relative w-[80px] h-[240px]">
      <!-- 路標柱子 -->
      <img src="/images/Menu/pillar.png" class="absolute w-32 h-80 left-[-20px]" />

      <!-- 功能路標 -->
      <div class="absolute top-0 left-0 w-full h-full">
        <img
          v-for="(sign, index) in signs"
          :key="sign.name"
          :src="sign.src"
          class="absolute w-[72px] h-16 cursor-pointer hover:scale-110 transition-all duration-300"
          :style="{ transform: `translate(${sign.offsetX}px, ${sign.offsetY}px)` }"
          @click="scrollTo(sign.ref)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Menu',
  props: {
    showMenu: { type: Boolean, default: false },
  },
  data() {
    return {
      signs: [
        { name: 'CIA', src: '/images/Menu/CIA.png', ref: 'ciaSection', offsetX: 2, offsetY: 0 },
        { name: 'HASH', src: '/images/Menu/HASH.png', ref: 'hashSection', offsetX: -43, offsetY: 40 },
        { name: 'TOP10', src: '/images/Menu/TOP10.png', ref: 'top10Section', offsetX: -50, offsetY: 102 },
        { name: '遊戲', src: '/images/Menu/game.png', ref: 'gameSection', offsetX: 8, offsetY: 138 },
      ],
    }
  },
  methods: {
    scrollTo(refName) {
      const target = this.$parent.$refs[refName]?.$el || this.$parent.$refs[refName]
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    },
  },
}
</script>
