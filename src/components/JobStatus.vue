<template>
  <button @click="$router.push('/jobs')" type="button" class="d-flex position-relative me-2 btn btn-info" data-bs-toggle="dropdown" aria-expanded="false">
    <span class="me-2">{{ jobs.length }}</span>
    <span class="me-2">{{ $t("menu.jobs") }}</span>
    <div v-if="jobs.length > 0" class="spinner-border text-dark my-1 spinner-border-sm" role="status">
          <span class="visually-hidden">
            {{ $t("navtop.jobsLoading") }}
          </span>
    </div>
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
