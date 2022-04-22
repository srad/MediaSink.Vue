<template>
  <div style="z-index: 10"
       class="card bg-light border position-relative shadow-sm bg-light zoom"
       :class="{'border-info': !checked, 'animate__animated animate__zoomOut': destroyed, 'border-2 border-danger': checked}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>
    <div class="position-relative">
      <div @click="checked=!checked" class="position-absolute" style="padding: 10px; right: 0px; top: 0px; z-index: 10;">
        <input v-if="showSelection" type="checkbox" :checked="checked" style="width: 20px; height: 20px">
      </div>
      <span class="badge bg-success position-absolute" style="user-select: none; z-index: 10; top: 10px; left: 10px">
        <span v-if="recording.width===1920">1080p</span>
        <span v-else-if="recording.width===2560">1440p</span>
        <span v-else-if="recording.width===1280">720p</span>
        <span v-else-if="recording.width===3840">4k</span>
        <span v-else>{{ recording.width }}x{{ recording.height }}</span>
      </span>
      <span v-if="recording.videoType==='cut'" class="badge bg-warning position-absolute" style="user-select: none; z-index: 10; bottom: 10px; right: 10px">cut</span>
      <Preview class="card-img-top" :data="recording" @selected="load(recording)" :preview-video="fileUrl + '/' + recording.previewVideo"/>
    </div>
    <div v-if="showTitle" class="card-body">
      <div class="card-title p-1 bg-primary" style="cursor:pointer;" @click="$router.push('/streams/' + recording.channelName)">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank">
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
        @convert="convert"
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
import { AxiosError } from 'axios';

const recordingApi = new RecordingApi();

export default defineComponent({
  name: 'RecordingItem',
  components: { RecordInfo, Preview },
  emits: ['destroyed', 'load', 'checked', 'converted', 'bookmark'],
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  props: {
    showSelection: { type: Boolean, default: false },
    showTitle: { type: Boolean, default: false },
    recording: { type: Object as PropType<RecordingResponse>, required: true }
  },
  watch: {
    checked(val) {
      this.$emit('checked', { checked: val, recording: this.recording });
    }
  },
  data() {
    return {
      checked: false,
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
      recordingApi[yesNo ? 'fav' : 'unfav'](recording.channelName, recording.filename)
          .then(() => {
            recording.bookmark = yesNo;
            this.$emit('bookmark', recording);
          })
          .catch((err: AxiosError) => {
            alert(err.response?.data);
          })
          .finally(() => this.busy = false);
    },
    generatePreview(recording: RecordingResponse) {
      if (window.confirm('Generate new preview?')) {
        this.busy = true;
        recordingApi.generatePreview(recording.channelName, recording.filename)
            .catch((err: AxiosError) => {
              alert(err.response?.data);
            })
            .finally(() => this.busy = false);
      }
    },
    convert({ recording, mediaType }: { recording: RecordingResponse, mediaType: string }) {
      if (!window.confirm(`Convert '${recording.filename}' video to type '${mediaType}'?`)) {
        return;
      }

      this.busy = true;
      recordingApi.convert(recording.channelName, recording.filename, mediaType).catch((err: AxiosError) => {
        alert(err.response?.data);
      }).finally(() => this.busy = false);
    },
    destroyRecording(recording: RecordingResponse) {
      if (!window.confirm(`Delete '${recording.filename}'?`)) {
        return;
      }

      this.busy = true;
      recordingApi.destroy(recording.channelName, recording.filename).then(() => {
        this.destroyed = true;
        setTimeout(() => this.$emit('destroyed', recording), 1000);
      }).catch((err: AxiosError) => {
        alert(err.response?.data);
      }).finally(() => this.busy = false);
    },
  }
});
</script>

<style scoped>

</style>
