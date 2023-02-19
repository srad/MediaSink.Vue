<template>
  <a>
    <i class="bi bi-star-fill text-warning" @click="$emit('fav', data, false)" v-if="faved"></i>
    <i v-else class="bi bi-star text-warning" @click="$emit('unfav', data, true)"></i>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FavButton',
  emits: ['fav', 'unfav'],
  props: {
    faved: { type: Boolean, required: true },
    data: { type: Object, required: true }
  }
});
</script>

<style scoped>

</style>
