<script setup>
import { RouterView } from 'vue-router'
import { useEventStore } from './stores/eventStore'

const eventStore = useEventStore()

// 移除自動事件機制
// onMounted(() => {
//   eventStore.scheduleFirstEvent()
// })
</script>

<template>
  <RouterView />
  
</template>







