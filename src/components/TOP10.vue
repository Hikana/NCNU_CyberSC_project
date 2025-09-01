<template>
  <div class="w-screen min-h-screen bg-grass relative overflow-x-hidden">
    <!-- A01 -->
    <div 
      :class="['absolute bg-A01 bg-contain bg-no-repeat bg-center rounded-lg']"
      style="top: 2vh; right: 3vw; width: 40vw; height: 40vw;"
      @mouseenter="changeImagesA01"
      @mouseleave="resetImages"
    ></div>
    <!-- A02 -->
    <div 
      :class="['absolute bg-A02 bg-contain bg-no-repeat bg-center rounded-lg']"
      style="top: 30vh; left: 3vw; width: 45vw; height: 45vw;"
      @mouseenter="changeImagesA02"
      @mouseleave="resetImages"
    ></div>
    <!-- A03 -->
    <div 
      :class="['absolute bg-A03 bg-contain bg-no-repeat bg-center rounded-lg']"
      style="top: 122vh; right: 6vw; width: 40vw; height: 40vw;"
      @mouseenter="changeImagesA03"
      @mouseleave="resetImages"
    ></div> 
    <!-- A04 -->
    <div 
      :class="['absolute bg-A04 bg-contain bg-no-repeat bg-center rotate-[308deg] rounded-lg']"
      style="top: 145vh; left: 2vw; width: 40vw; height: 40vw;"
      @mouseenter="changeImagesA04"
      @mouseleave="resetImages"
    ></div>
    <!-- A05 -->
    <div 
      :class="['absolute bg-A05 bg-contain bg-no-repeat bg-center rotate-[281deg] rounded-lg']"
      style="top: 185vh; right: 2vw; width: 35vw; height: 35vw;"
      @mouseenter="changeImagesA05"
      @mouseleave="resetImages"
    ></div>
    <!-- A06 -->
    <div 
      :class="['absolute bg-A06 bg-contain bg-no-repeat bg-center rotate-[46deg] rounded-lg']"
      style="top: 245vh; left: 30vw; width: 40vw; height: 40vw;"
      @mouseenter="changeImagesA06"
      @mouseleave="resetImages"
    ></div>
    <!-- A07 -->
    <div 
      :class="['absolute bg-A07 bg-contain bg-no-repeat bg-center rounded-lg']"
      style="top: 305vh; left: 2vw; width: 40vw; height: 40vw;"
      @mouseenter="changeImagesA07"
      @mouseleave="resetImages"
    ></div>
    <!-- A08 -->
    <div 
      :class="['absolute bg-A08 bg-contain bg-no-repeat bg-center rotate-[9deg] rounded-lg']"
      style="top: 310vh; right: 0vw; width: 50vw; height: 50vw;"
      @mouseenter="changeImagesA08"
      @mouseleave="resetImages"
    ></div>
    <!-- A09 -->
    <div 
      :class="['absolute bg-A09 bg-contain bg-no-repeat bg-center rounded-lg']"
      style="top: 385vh; left: 4vw; width: 35vw; height: 35vw;"
      @mouseenter="changeImagesA04"
      @mouseleave="resetImages"
    ></div>
    <!-- A10 -->
    <div 
      :class="['absolute bg-A10 bg-contain bg-no-repeat bg-center rounded-lg']"
      style="top: 420vh; left: 35vw; width: 50vw; height: 50vw;"
      @mouseenter="changeImagesA04"
      @mouseleave="resetImages"
    ></div>

    <!-- 石頭1 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg ', imageOrigin1]"
      style="top: 12vh; left: 30vw; width: 28vw; height: 28vw;"
    ></div>
    <!-- 石頭2 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg', imageOrigin2]"
      style="top: 55vh; right: 28vw; width: 32vw; height: 32vw;"
    ></div>
    <!-- 石頭3 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg', imageOrigin3]"
      style="top: 75vh; right: 6vw; width: 32vw; height: 32vw;"
    ></div>
    <!-- 石頭4 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg', imageOrigin4]"
      style="top: 105vh; left: 30vw; width: 37vw; height: 37vw;"
    ></div>
    <!-- 石頭5 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rotate-[301deg] rounded-lg', imageOrigin5]"
      style="top: 100vh; left: 5vw; width: 32vw; height: 32vw;"
    ></div>
    <!-- 石頭6 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg', imageOrigin6]"
      style="top: 165vh; left: 37vw; width: 28vw; height: 28vw;"
    ></div>
    <!-- 石頭7 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg rotate-[300deg]', imageOrigin7]"
      style="top: 205vh; left: 17vw; width: 28vw; height: 28vw;"
    ></div>
    <!-- 石頭8 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg rotate-[300deg]', imageOrigin8]"
      style="top: 205vh; left: 40vw; width: 32vw; height: 32vw;"
    ></div>
    <!-- 石頭9 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg rotate-[230deg]', imageOrigin9]"
      style="top: 242vh; right: 8vw; width: 30vw; height: 30vw;"
    ></div>
    <!-- 石頭10 -->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg rotate-[150deg]', imageOrigin10]"
      style="top: 250vh; left: 2vw; width: 38vw; height: 38vw;"
    ></div>

    <!-- 裝飾性小石頭 -->
    <!--<div class="absolute bg-gray-700 rounded-full transform rotate-12" style="top: 156vh; left: 30vw; width: 5vw; height: 6vw;"></div>-->
    <div 
      :class="['absolute bg-contain bg-no-repeat bg-center rounded-lg bg-石頭1']"
      style="top: 210vh; left: 5vw; width: 15vw; height: 15vw;"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const imageOrigin1 = ref('bg-石頭1')
const imageOrigin2 = ref('bg-石頭2')
const imageOrigin3 = ref('bg-石頭3')
const imageOrigin4 = ref('bg-石頭4')
const imageOrigin5 = ref('bg-石頭5')
const imageOrigin6 = ref('bg-石頭6') 
const imageOrigin7 = ref('bg-石頭2')
const imageOrigin8 = ref('bg-石頭4')
const imageOrigin9 = ref('bg-石頭1')
const imageOrigin10 = ref('bg-石頭3')
const imageOrigin11 = ref('bg-石頭5')
const imageOrigin12 = ref('bg-石頭6') 

const changeImagesA01 = () => {
  imageOrigin1.value = 'bg-石1(A01)'  
  imageOrigin2.value = 'bg-石2(A01)'  
  imageOrigin3.value = 'bg-石3(A01)' 
}
const changeImagesA02 = () => {
  imageOrigin2.value = 'bg-石2(A02)'  
  imageOrigin3.value = 'bg-石3(A02)' 
}
const changeImagesA03 = () => {  
  imageOrigin3.value = 'bg-石3(A03)' 
  imageOrigin4.value = 'bg-石4(A03)'
  imageOrigin5.value = 'bg-石5(A03)'
  imageOrigin6.value = 'bg-石6(A03)'
}
const changeImagesA04 = () => {  
  imageOrigin4.value = 'bg-石4(A04)'
  imageOrigin5.value = 'bg-石5(A04)'
  imageOrigin6.value = 'bg-石6(A04)'
}

const resetImages = () => {
  imageOrigin1.value = 'bg-石頭1'  
  imageOrigin2.value = 'bg-石頭2'
  imageOrigin3.value = 'bg-石頭3'  
  imageOrigin4.value = 'bg-石頭4'  
  imageOrigin5.value = 'bg-石頭5'  
  imageOrigin6.value = 'bg-石頭6'  
}
</script>