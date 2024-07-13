<template>
  <button @click="$router.push('/jobs')" type="button" class="d-flex position-relative me-2 btn btn-info">
    <span class="me-2">{{ props.jobs.length }}</span> <span class="me-2">{{ $t('menu.jobs') }}</span>
  </button>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { ModelsJob } from "../services/api/v1/StreamSinkClient.ts";

const props = defineProps<{ jobs: ModelsJob[] }>();
</script>

<style scoped>
</style>