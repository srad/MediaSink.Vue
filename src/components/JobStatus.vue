<template>
  <button @click="$router.push('/jobs')" type="button" class="d-flex position-relative me-2 btn btn-info">
    <span class="me-2">{{ jobs.length }}</span> <span class="me-2">{{ $t('menu.jobs') }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'JobStatus',
  props: {
    jobs: { type: Array, required: true }
  }
});
</script>

<style scoped>

</style>
