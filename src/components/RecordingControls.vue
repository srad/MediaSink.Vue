<template>
  <div class="justify-content-between d-flex">
    <JobStatus :jobs="jobs" :total-count="totalCount"/>
    <button v-if="!props.recording" class="btn btn-info d-flex" @click="emit('record', true)">
      <i class="bi bi-play-fill"></i>
      <span class="ms-1">{{ t('navtop.startRecording') }}</span>
    </button>
    <button v-else class="btn btn-danger blink d-flex" @click="emit('record', false)">
      <i class="bi bi-stop-fill me-2"></i>
      <span class="d-none d-xl-inline d-flex justify-content-between ms-1">{{ t('navtop.stopRecording') }}</span>
    </button>
    <button class="btn btn-success ms-2 d-flex d-none d-sm-none d-md-block" @click="emit('add')">
      <i class="bi bi-plus"></i>
      <span class="ms-1">
        {{ t('navtop.addStream') }}
      </span>
    </button>
    <button v-if="route.name=='Stream'" class="border-success-subtle btn btn-lg shadow-sm btn-success text-white ms-2 d-flex d-md-none position-fixed" style="bottom: 5%; right: 10%; border-radius: 50%;" @click="emit('add')">
      <i class="bi bi-plus-lg"></i>
    </button>
    <button v-if="showLogout" type="button" class="ms-2 btn btn-warning" @click="emit('logout')">
      <i class="bi bi-box-arrow-right"></i>
      <span class="d-none d-xl-inline d-flex justify-content-between ms-1">Logout</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import JobStatus from './JobStatus.vue';
import { useRoute } from 'vue-router';
import { DatabaseJob } from '../services/api/v1/StreamSinkClient.ts';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'logout'): void
  (e: 'record', value: boolean): void
}>();

const props = defineProps<{
  jobs: DatabaseJob[],
  recording: boolean
  showLogout: boolean
  totalCount: number;
}>();
</script>

<style scoped>

</style>
