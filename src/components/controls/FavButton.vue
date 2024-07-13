<template>
  <a>
    <i class="bi bi-star-fill text-warning" @click="emit('fav', props.data, false)" v-if="faved"></i>
    <i v-else class="bi bi-star text-warning" @click="emit('unfav', props.data, true)"></i>
  </a>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const emit = defineEmits<{
  (e: 'fav', data: object, value: boolean): void
  (e: 'unfav', data: object, value: boolean): void
}>();

const props = defineProps<{
  faved: boolean
  data: object
}>();
</script>

<style scoped>
</style>