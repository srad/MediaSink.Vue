<template>
  <div class="row py-2">
    <h4>Stream: <span class="text-danger">{{ $route.params.channel }}</span></h4>
    <hr/>
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

const recordingApi = new RecordingApi();

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  recordings: RecordingResponse[];
  busy: boolean;
}

export default defineComponent({
  name: 'StreamItemView',
  components: { RecordingItem },
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  watch: {
    $route() {
      this.recordings = [];
    },
  },
  data(): RecordingData {
    return {
      busy: false,
      recordings: []
    };
  },
  methods: {
    destroyRecording(recording: RecordingResponse) {
      for (let i = 0; i < this.recordings.length; i += 1) {
        if (this.recordings[i].filename === recording.filename) {
          this.recordings.splice(i, 1);
          break;
        }
      }
    }
  },
  created() {
    //@ts-ignore
    recordingApi.getRecordings(this.$route.params.channel).then(res => {
      this.recordings = res.data;
      this.busy = false;
      window.scrollTo(0, 0);
    }).catch(err => {
      this.busy = false;
      alert(err);
    });
  }
});
</script>

<style scoped>

</style>
