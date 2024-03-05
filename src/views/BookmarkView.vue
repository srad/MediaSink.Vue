<template>
  <div class="row my-2">
    <LoadIndicator :busy="busy" :empty="recordings.length === 0" empty-text="No Videos">
      <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem :recording="recording" @destroyed="destroyRecording" @bookmark="bookmark"/>
      </div>
    </LoadIndicator>
  </div>
</template>

<script lang="ts">
import { createClient } from '@/services/api/v1/ClientFactory';
import { DatabaseRecording as RecordingResponse } from '@/services/api/v1/StreamSinkClient';
import { defineComponent } from 'vue';
import RecordingItem from '@/components/RecordingItem.vue';
import LoadIndicator from '@/components/LoadIndicator.vue';

interface BookmarkData {
  baseUrl?: string;
  apiUrl?: string;
  recordings: RecordingResponse[];
  busy: boolean;
}

const api = createClient();

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
    removeItem(recording: RecordingResponse) {
      const i = this.recordings.findIndex(r => r.filename === recording.filename);
      if (i !== -1) {
        this.recordings.splice(i, 1);
      }
    },

    bookmark(recording: RecordingResponse) {
      if (!recording.bookmark) {
        this.removeItem(recording);
      }
    },
    async destroyRecording(recording: RecordingResponse) {
      if (!window.confirm(this.$t('crud.destroy', [recording.filename]))) {
        return;
      }

      try {
        await api.recordings.recordingsDelete(recording.channelName!, recording.filename!);
        this.removeItem(recording);
      } catch (ex) {
        alert(ex);
      }
    },
  },
  async created() {
    const response = await api.recordings.bookmarksList();
    this.recordings = response.data;
    this.busy = false;
  }
});
</script>

<style scoped></style>
