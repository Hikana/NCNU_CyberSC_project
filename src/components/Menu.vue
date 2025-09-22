<template>
  <div
    v-show="showMenu"
    class="fixed bottom-6 right-6 z-50 transition-opacity duration-500"
    :class="showMenu ? 'opacity-100' : 'opacity-0'"
    style="transform: scale(calc(100vw / 1920)); transform: scale(1.ˇ); transform-origin: bottom right;"
  >
    <!-- 整個路標組 -->
    <div class="relative w-[80px] h-[240px]">
      <!-- 路標柱子 -->
      <img :src="pillar" class="absolute w-32 h-80 left-[-20px]" />

      <!-- 功能路標 -->
      <div class="absolute top-0 left-0 w-full h-full">
        <img
          v-for="(sign, index) in signs"
          :key="sign.name"
          :src="sign.src"
          class="absolute w-18 h-16 cursor-pointer hover:scale-110 transition-all duration-300"
          :style="{
            transform: `translate(${sign.offsetX}px, ${sign.offsetY}px)`,
          }"
          @click="scrollTo(sign.ref)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import pillar from "/src/assets/image/Menu/pillar.png"
import CIA from "/src/assets/image/Menu/CIA.png"
import HASH from "/src/assets/image/Menu/HASH.png"
import TOP10 from "/src/assets/image/Menu/TOP10.png"
import game from "/src/assets/image/Menu/game.png"

export default {
  name: "Menu",
  props: {
    showMenu: { type: Boolean, default: false },
  },
  data() {
    return {
      pillar,
      signs: [
        { name: "CIA", src: CIA, ref: "ciaSection", offsetX: 2, offsetY: 0 },
        { name: "HASH", src: HASH, ref: "hashSection", offsetX: -43, offsetY: 40 },
        { name: "TOP10", src: TOP10, ref: "top10Section", offsetX: -50, offsetY: 102 },
        { name: "遊戲", src: game, ref: "gameSection", offsetX: 8, offsetY: 138 },
      ],
    }
  },
  methods: {
    scrollTo(refName) {
      const target = this.$parent.$refs[refName]?.$el || this.$parent.$refs[refName]
      if (target) {
        target.scrollIntoView({ behavior: "smooth" })
      }
    },
  },
}
</script>
