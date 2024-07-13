<template>
  <div class="justify-content-between d-flex">
    <JobStatus :jobs="props.jobs"/>
    <button v-if="!recording" class="btn btn-secondary d-flex" @click="emit('record', true)">
      <i class="bi bi-record-fill"></i>
      {{ $t("navtop.startRecording") }}
    </button>
    <button v-else class="btn btn-danger blink d-flex" @click="emit('record', false)">
      <i class="bi bi-stop-fill me-2"></i>
      <span>{{ $t("navtop.stopRecording") }}</span>
    </button>
    <button class="btn btn-success text-white ms-2 d-flex d-none d-sm-none d-md-block" @click="emit('add')">
      <i class="bi bi-plus"></i>
      <span>
        {{ $t("navtop.addStream") }}
      </span>
    </button>
    <button v-if="$route.name=='Stream'" class="border-success-subtle btn btn-lg shadow-sm btn-success text-white ms-2 d-flex d-md-none position-fixed" style="bottom: 5%; right: 10%; border-radius: 50%;" @click="emit('add')">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ModelsJob } from "../services/api/v1/StreamSinkClient.ts";
import JobStatus from "./JobStatus.vue";

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'record', value: boolean): void
}>();

const props = defineProps<{
  jobs: ModelsJob[]
  recording: boolean
}>();
</script>

<style scoped>

</style>
