<template>
  <div class="row">
    <LoadIndicator :busy="busy" :empty="recordings.length === 0" empty-text="No Videos">
      <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem :recording="recording" @destroyed="destroyRecording"/>
      </div>
    </LoadIndicator>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import RecordingItem from '@/components/RecordingItem.vue';
import { AxiosError } from 'axios';
import LoadIndicator from '@/components/LoadIndicator.vue';

interface BookmarkData {
  baseUrl?: string;
  apiUrl?: string;
  recordings: RecordingResponse[];
  busy: boolean;
}

const recordingApi = new RecordingApi();

export default defineComponent({
  components: { LoadIndicator, RecordingItem },
  inject: ['baseUrl', 'apiUrl'],
  data(): BookmarkData {
    return {
      busy: true,
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
      this.busy = false;
    });
  }
});
</script>

<style scoped></style>
