<template>
  <div class="row my-2">
    <LoadIndicator :busy="busy" :empty="recordings.length === 0" empty-text="No Videos">
      <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem
            :recording="recording"
            @destroyed="destroyRecording"
            @bookmark="bookmark"
            :show-selection="false"
            :show-title="false"/>
      </div>
    </LoadIndicator>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { createClient } from '../services/api/v1/ClientFactory';
import { ModelsRecording as RecordingResponse } from '../services/api/v1/StreamSinkClient';
import RecordingItem from '../components/RecordingItem.vue';

const { t } = useI18n();
import LoadIndicator from '../components/LoadIndicator.vue';
import { useI18n } from "vue-i18n";

const busy = ref(true);
const recordings = ref<RecordingResponse[]>([]);

const api = createClient();

const removeItem = (recording: RecordingResponse) => {
  const i = recordings.value.findIndex(r => r.filename === recording.filename);
  if (i !== -1) {
    recordings.value.splice(i, 1);
  }
};

const bookmark = (recording: RecordingResponse) => {
  if (!recording.bookmark) {
    removeItem(recording);
  }
};

const destroyRecording = async (recording: RecordingResponse) => {
  if (!window.confirm(t('crud.destroy', [ recording.filename ]))) {
    return;
  }

  try {
    await api.recordings.recordingsDelete(recording.recordingId);
    removeItem(recording);
  } catch (ex) {
    alert(ex);
  }
};

onMounted(() => {
  api.recordings.bookmarksList()
      .then(response => {
        recordings.value = response.data;
      }).finally(() => busy.value = false);
})
</script>

<style scoped></style>