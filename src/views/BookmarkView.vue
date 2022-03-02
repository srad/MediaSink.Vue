<template>
  <div class="row">
    <div v-if="recordings.length === 0" class="d-flex justify-content-center">
      <h3 class="text-dark">
        No Videos
      </h3>
    </div>
    <div v-else v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-4 col-xl-3 col-xxl-2 col-md-12">
      <RecordingItem :recording="recording" @destroyed="destroyRecording"/>
    </div>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import RecordingItem from '@/components/RecordingItem.vue';
import { AxiosError } from 'axios';

interface BookmarkData {
  baseUrl?: string;
  apiUrl?: string;
  recordings: RecordingResponse[];
}

const recordingApi = new RecordingApi();

export default defineComponent({
  components: { RecordingItem },
  inject: ['baseUrl', 'apiUrl'],
  data(): BookmarkData {
    return {
      recordings: []
    };
  },
  methods: {
    destroyRecording(recording: RecordingResponse) {
      if (!window.confirm(`Delete '${recording.filename}'?`)) {
        return;
      }

      recordingApi.destroy(recording.channelName, recording.filename).then(() => {
        for (let i = 0; i < this.recordings.length; i += 1) {
          if (this.recordings[i].filename === recording.filename) {
            this.recordings.splice(i, 1);
            break;
          }
        }
      }).catch((err: AxiosError) => {
        alert(err.response?.data);
      });
    },
  },
  created() {
    recordingApi.getBookmarks().then(res => {
      this.recordings = res.data;
    });
  }
});
</script>

<style scoped></style>
