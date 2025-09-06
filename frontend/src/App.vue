<script setup>
import { onMounted } from 'vue'
import { useEventStore } from './stores/eventStore'
import RandomEventModal from './components/RandomEventModal.vue'

const eventStore = useEventStore()

onMounted(() => {
  eventStore.scheduleFirstEvent()
})
</script>

<template>
  <RouterView />
  <RandomEventModal />
</template>







