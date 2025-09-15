<script setup>
import { onMounted } from 'vue'
import { useEventStore } from './stores/eventStore'


const eventStore = useEventStore()

onMounted(() => {
  eventStore.scheduleFirstEvent()
})
</script>

<template>
  <RouterView />
  
</template>







