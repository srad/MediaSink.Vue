<template>
  <div class="justify-content-between d-flex gap-1">
    <JobStatus :jobs="jobs" :total-count="totalCount" @click="router.push('/jobs')" />
    <button v-if="!props.isRecording" class="btn btn-info d-flex" @click="emit('record', true)">
      <i class="bi bi-play-fill"></i>
      <span class="ms-1 d-none d-sm-inline">{{ t("navtop.startRecording") }}</span>
    </button>
    <button v-else class="btn btn-danger blink d-flex" @click="emit('record', false)">
      <i class="bi bi-stop-fill"></i>
      <span class="d-none d-xl-inline d-flex justify-content-between ms-1">{{ t("navtop.stopRecording") }}</span>
    </button>
    <button class="btn btn-success d-flex gap-2 d-none d-sm-none d-md-block" @click="emit('add')">
      <i class="bi bi-plus"></i>
      <span class="d-none d-xl-inline">{{ t("navtop.addStream") }}</span>
    </button>

    <button v-if="route.path.startsWith('/streams')" class="btn btn-lg btn-success shadow-sm border-success-subtle d-md-none position-fixed d-flex justify-content-center align-items-center" style="bottom: 5%; right: 10%; border-radius: 50%; width: 3.5rem; height: 3.5rem" @click="emit('add')">
      <i class="bi bi-plus-lg fw-bold"></i>
    </button>

    <button v-if="showLogout" type="button" class="btn btn-warning gap-2" @click="emit('logout')">
      <i class="bi bi-box-arrow-right"></i>
      <span class="d-none d-xl-inline">Logout</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import JobStatus from "./JobStatus.vue";
import type { DatabaseJob } from "../services/api/v1/StreamSinkClient";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const emit = defineEmits<{
  (e: "add"): void;
  (e: "logout"): void;
  (e: "record", value: boolean): void;
}>();

const props = defineProps<{
  jobs: DatabaseJob[];
  isRecording: boolean;
  showLogout: boolean;
  totalCount: number;
}>();
</script>

<style scoped></style>
