<template>
  <div class="justify-content-between d-flex">
    <JobStatus :jobs="jobs"/>
    <button v-if="!recording" class="btn btn-secondary d-flex" @click="$emit('record', true)">
      <i class="bi bi-record-fill"></i>
      {{ $t("navtop.startRecording") }}
    </button>
    <button v-else class="btn btn-danger blink d-flex" @click="$emit('record', false)">
      <i class="bi bi-stop-fill"></i>
      <span class="d-none d-sm-none d-md-block">
            {{ $t("navtop.stopRecording") }}
          </span>
    </button>
    <button class="btn btn-success text-white ms-2 d-flex" @click="$emit('add')">
      <i class="bi bi-plus"></i>
      <span class="d-none d-sm-none d-md-block">
            {{ $t("navtop.addStream") }}
          </span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JobStatus from '@/components/JobStatus.vue';

export default defineComponent({
  name: 'RecordingControls',
  components: { JobStatus },
  emits: ['add', 'record'],
  props: {
    jobs: { type: Array, required: true },
    recording: { type: Boolean, required: true }
  }
});
</script>

<style scoped>

</style>
