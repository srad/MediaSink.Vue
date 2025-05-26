<template>
  <div class="container-fluid py-2">
    <div class="btn-group">
      <button type="button" :disabled="isUpdating" class="btn btn-primary me-2" @click="updateInfo" :class="{'blink btn-danger': isUpdating}">
        <span class="me-2">Update video metadata</span>
        <i class="bi bi-arrow-clockwise"></i>
      </button>
      <button class="btn btn-primary me-2" @click="posters">
        <span class="me-2">Regenerate posters</span>
        <i class="bi bi-card-image"></i>
      </button>

      <button :disabled="importing" class="btn btn-primary" @click="startImport">
        <span class="me-2">Start Import</span>
        <i class="bi bi-disc"></i>
      </button>
    </div>

    <div v-if="importing" class="d-flex gap-2">
      <span :class="{'blink bg-danger-subtle': importing}">Importing ({{ importProgress }}/{{ importSize }})</span>
      <span>
        <div class="progress">
          <span class="progress-bar" role="progressbar" :style="{width: (importProgress / importSize) * 100 + '%'}" aria-valuenow="{{importProgress}}" aria-valuemin="0" aria-valuemax="{{importSize}}"></span>
        </div>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {onBeforeRouteLeave} from "vue-router";
  import {createClient} from "@/services/api/v1/ClientFactory";

  const importing = ref(false);
  const importProgress = ref(0);
  const importSize = ref(0);

  const isUpdating = ref(false);

  const id = ref<number>(0);

  //const receivedMb = computed(() => ((netInfo.value?.receiveBytes || 0) / 1024 / 1024).toFixed(2));
  //const transmittedMb = computed(() => ((netInfo.value?.transmitBytes || 0) / 1024 / 1024).toFixed(2));

  const startImport = async () => {
    if (window.confirm("Start Import?")) {
      const client = createClient();
      await client.admin.importCreate();
      importing.value = true;
    }
  };

  const posters = async () => {
    if (window.confirm("Regenerate all posters?")) {
      const client = createClient();
      await client.recordings.generatePostersCreate();
    }
  };

  const updateInfo = () => {
    if (window.confirm("Check all durations and update in database?")) {
      const client = createClient();
      client.recordings
        .updateinfoCreate()
        .then(() => (isUpdating.value = true))
        .catch((res) => console.error((<{error: string}>res).error));
    }
  };

  onBeforeRouteLeave(() => {
    clearInterval(id.value);
  });
</script>

<style scoped></style>
