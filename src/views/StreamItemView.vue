<template>
  <div class="my-2">
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
      <div class="container-fluid justify-content-end">
        <button v-if="selectedRecordings.length > 0" class="btn btn-danger" @click="destroySelection">
          <i class="bi bi-trash3-fill px-2"/>
        </button>

        <button class="btn btn-light text-danger" @click="deleteChannel" v-if="selectedRecordings.length == 0">
          <i class="bi bi-trash3-fill px-2"/>
        </button>

        <button class="btn btn-light" @click="$refs.file.click()" v-if="selectedRecordings.length == 0">
          <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
          <i class="bi bi-upload px-2"/>
        </button>

        <button class="btn btn-light">
          <i class="bi bi-pencil px-2"/>
        </button>

        <button class="btn btn-light" style="color: goldenrod">
          <ChannelBookmarkButton :file-name="channelName" :bookmarked="false" />
        </button>
      </div>
    </nav>

    <div class="row pb-5">
      <div class="d-flex align-middle fs-5 pb-2 fw-bolder">
        <span class="text-primary px-2">{{ $route.params.channel }}</span>
      </div>

      <hr/>

      <LoadIndicator :busy="busy" :empty="recordings.length === 0" empty-text="No Videos">
        <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
          <RecordingItem :show-selection="true" @checked="selectRecording" :recording="recording" @destroyed="destroyRecording"/>
        </div>
      </LoadIndicator>
    </div>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import RecordingItem from '@/components/RecordingItem.vue';
import { ChannelApi } from '@/services/api/v1/channelApi';
import { Modal } from 'bootstrap';
import { AxiosError, CancelTokenSource } from 'axios';
import LoadIndicator from '@/components/LoadIndicator.vue';
import ChannelBookmarkButton from "@/components/ChannelBookmarkButton.vue";

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
  selectedRecordings: RecordingResponse[];
}

export default defineComponent({
  name: 'StreamItemView',
  components: { ChannelBookmarkButton, LoadIndicator, RecordingItem },
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  watch: {
    $route() {
      this.recordings = [];
    },
  },
  data(): RecordingData {
    return {
      selectedRecordings: [],
      modal: undefined,
      cancellationToken: undefined,
      uploadProgress: 0,
      busy: false,
      recordings: [],
      channelName: this.$route.params.channel as string,
    };
  },
  methods: {
    async destroySelection() {
      if (!window.confirm('Delete selection?')) {
        return;
      }
      for (let i = 0; i < this.selectedRecordings.length; i++) {
        const rec = this.selectedRecordings[i];
        await recordingApi.destroy(rec.channelName, rec.filename);
        const j = this.recordings.findIndex(r => r.filename === rec.filename);
        if (j !== -1) {
          this.recordings.splice(j, 1);
        }
      }
      this.selectedRecordings = [];
    },
    selectRecording(data: { checked: boolean, recording: RecordingResponse }) {
      if (data.checked) {
        this.selectedRecordings.push(data.recording);
      } else {
        const i = this.selectedRecordings.findIndex(rec => rec.filename === data.recording.filename);
        if (i !== -1) {
          this.selectedRecordings.splice(i, 1);
        }
      }
    },
    deleteChannel() {
      if (window.confirm(`Delete channel "${this.channelName}"?`)) {
        channelApi.destroy(this.channelName)
            .then(() => this.$store.commit('destroyChannel', { channelName: this.channelName }))
            .finally(() => this.$router.back());
      }
    },
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
        }).catch((err: AxiosError) => {
          alert(err.response?.data);
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

    this.busy = true;

    recordingApi.getRecordings(this.channelName).then(res => {
      this.recordings = res.data;
      window.scrollTo(0, 0);
    }).catch((err: AxiosError) => alert(err.response?.data))
        .finally(() => this.busy = false);
  }
});
</script>

<style scoped>

</style>
