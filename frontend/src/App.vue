<script setup>
import { RouterView } from 'vue-router'
import { useEventStore } from './stores/eventStore'

const eventStore = useEventStore()

</script>

<template>
  <RouterView />
  
</template>







