<template>
  <div style="z-index: 10"
       class="card bg-light border-primary border position-relative shadow-sm bg-light"
       :class="{'animate__animated animate__zoomOut': destroyed,}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>
    <Preview class="card-img-top" :data="recording" @selected="load(recording)" :preview-video="fileUrl + '/' + recording.previewVideo"/>
    <div v-if="showTitle" class="card-body">
      <div class="card-title p-1 bg-primary">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank" @click="$router.push('/streams/' + recording.channelName)">
            {{ recording.channelName }}
          </a>
        </h6>
      </div>
    </div>
    <RecordInfo
        :url="apiUrl + '/recordings/' + recording.channelName + '/' + recording.filename"
        :duration="recording.duration"
        :size="recording.size"
        :bit-rate="recording.bitRate"
        :bookmark="recording.bookmark"
        :created-at="recording.createdAt"
        :data="recording"
        :width="recording.width"
        :height="recording.height"
        @bookmarked="bookmark"
        @preview="generatePreview"
        @destroy="destroyRecording"/>
  </div>
</template>

<script lang="ts">
import RecordInfo from '@/components/RecordInfo.vue';
import Preview from '@/components/Preview.vue';
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent, PropType } from 'vue';

const recordingApi = new RecordingApi();

export default defineComponent({
  name: 'RecordingItem',
  components: { RecordInfo, Preview },
  emits: ['destroyed', 'load'],
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  props: {
    showTitle: { type: Boolean, default: false },
    recording: { type: Object as PropType<RecordingResponse>, required: true }
  },
  data() {
    return {
      busy: false,
      destroyed: false,
    };
  },
  methods: {
    load(recording: RecordingResponse) {
      this.$router.push({
        name: 'Video',
        params: {
          channelName: recording.channelName,
          filename: recording.filename,
          pathRelative: recording.pathRelative,
          previewStripe: recording.previewStripe,
        },
      });
    },
    bookmark(recording: RecordingResponse, yesNo: boolean) {
      this.busy = true;
      recordingApi.bookmark(recording.channelName, recording.filename, yesNo)
          .then(() => {
            recording.bookmark = yesNo;
            this.$store.commit('pauseChannel', { channel: recording.channelName, pause: yesNo });
            this.busy = false;
          })
          .catch(err => {
            alert(err);
            this.busy = false;
          });
    },
    generatePreview(recording: RecordingResponse) {
      if (window.confirm('Generate new preview?')) {
        this.busy = true;
        recordingApi.generatePreview(recording.channelName, recording.filename)
            .then(() => {
              this.busy = false;
            })
            .catch(err => {
              this.busy = false;
              alert(err.data);
            });
      }
    },
    destroyRecording(recording: RecordingResponse) {
      if (!window.confirm(`Delete '${recording.filename}'?`)) {
        return;
      }

      this.busy = true;
      recordingApi.destroy(recording.channelName, recording.filename).then(() => {
        this.destroyed = true;
        setTimeout(() => this.$emit('destroyed', recording), 1000);
        this.busy = false;
      }).catch(err => {
        this.busy = false;
        console.error(err);
        alert(err);
      });
    },
  }
});
</script>

<style scoped>

</style>
