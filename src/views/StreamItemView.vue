<template>
  <div>
    <div ref="upload" style="display: none" class="modal modal-dialog modal-dialog-centered" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Uploading Video</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h5>
              Progress: {{ (uploadProgress * 100).toFixed(0) }}%
            </h5>
            <div class="progress">
              <div class="progress-bar progress-bar-animated progress-bar-striped bg-warning" role="progressbar" :style="{width: `${uploadProgress*100}%`}" aria-valuemax="1" aria-valuemin="0" aria-valuenow="0.4"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-warning" @click="cancelUpload">Cancel Upload</button>
          </div>
        </div>
      </div>
    </div>

    <nav class="navbar fixed-bottom navbar-light bg-light border-info border-top">
      <div class="container-fluid justify-content-end w-100">
        <button class="btn btn-danger me-3">
          Delete Stream
        </button>

        <button class="btn btn-info text-white" @click="$refs.file.click()">
          <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
          Upload Video
        </button>
      </div>
    </nav>

    <div class="row pb-5">
      <h4 class="py-0"><span class="text-primary">{{ $route.params.channel }}</span></h4>
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
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import RecordingItem from '@/components/RecordingItem.vue';
import { ChannelApi } from '@/services/api/v1/channelApi';
import { Modal } from 'bootstrap';
import { CancelTokenSource } from 'axios';

const recordingApi = new RecordingApi();
const channelApi = new ChannelApi();

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  channelName: string;
  recordings: RecordingResponse[];
  busy: boolean;
  uploadProgress: number;
  modal?: Modal;
  cancellationToken?: CancelTokenSource;
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
      modal: undefined,
      cancellationToken: undefined,
      uploadProgress: 0,
      busy: false,
      recordings: [],
      channelName: this.$route.params.channel as string,
    };
  },
  methods: {
    cancelUpload() {
      if (this.cancellationToken) {
        this.cancellationToken.cancel();
      }
      this.modal!.hide();
    },
    submit() {
      const el = this.$refs.file as HTMLInputElement;
      if (el.files && el.files!.length > 0) {
        this.uploadProgress = 0;
        this.modal!.show();
        const [req, cancellationToken] = channelApi.upload(this.channelName, el.files![0], pcent => this.uploadProgress = pcent);
        req.then(res => {
          this.uploadProgress = 0;
          this.recordings.unshift(res.data);
          this.cancellationToken = undefined;
          this.modal!.hide();
          // clear old file
          el.value = '';
        }).catch(() => {
          this.modal!.hide();
        });
        this.cancellationToken = cancellationToken;
      }
    },
    destroyRecording(recording: RecordingResponse) {
      for (let i = 0; i < this.recordings.length; i += 1) {
        if (this.recordings[i].filename === recording.filename) {
          this.recordings.splice(i, 1);
          break;
        }
      }
    }
  },
  mounted() {
    this.modal = new Modal(this.$refs.upload as HTMLElement);

    recordingApi.getRecordings(this.channelName).then(res => {
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
