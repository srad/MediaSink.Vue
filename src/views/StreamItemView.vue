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

        <button class="btn btn-light" @click="clickFile" v-if="selectedRecordings.length == 0">
          <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
          <i class="bi bi-upload px-2"/>
        </button>

        <button class="btn btn-light">
          <i class="bi bi-pencil px-2"/>
        </button>

        <button class="btn btn-light" style="color: goldenrod">
          <ChannelBookmarkButton :channel-id="channelId" :bookmarked="fav"/>
        </button>
      </div>
    </nav>

    <div class="row pb-5">
      <div class="d-flex align-middle fs-5 pb-2 fw-bolder">
        <span class="text-primary px-2">{{ $route.params.channel }}</span>
      </div>

      <hr/>

      <LoadIndicator :busy="busy" :empty="channel?.recordings?.length === 0" empty-text="No Videos">
        <div v-for="recording in channel?.recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
          <RecordingItem
              @destroyed="destroyRecording"
              @checked="selectRecording"
              :show-selection="true"
              :recording="recording"
              :show-title="false"/>
        </div>
      </LoadIndicator>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import RecordingItem from '../components/RecordingItem.vue';
import { Modal } from 'bootstrap';
import LoadIndicator from '../components/LoadIndicator.vue';
import ChannelBookmarkButton from "../components/ChannelBookmarkButton.vue";
import { createClient } from "../services/api/v1/ClientFactory";
import {
  ModelsChannel as ChannelResponse,
  ModelsRecording as RecordingResponse
} from "../services/api/v1/StreamSinkClient";
import { CancelTokenSource } from 'axios';
import { useRoute, useRouter } from "vue-router";
import { useStore } from "../store";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const api = createClient();
const route = useRoute();
const router = useRouter();
const store = useStore();

// Elements
const file = ref<HTMLInputElement | null>(null);
const upload = ref<HTMLDivElement | null>(null);

const selectedRecordings = ref<RecordingResponse[]>([]);
const modal = ref<Modal | null>(null);
const uploadProgress = ref(0);
const busy = ref(false);
const channel = ref<ChannelResponse | null>(null);
const channelId = route.params.id as unknown as number;

let cancellationToken: CancelTokenSource | null = null;

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

// watch(route, () => {
//   chan.value = [];
// });

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const fav = computed(() => channel.value && channel.value.fav || false);

const clickFile = () => file.value?.click();

const destroySelection = async () => {
  if (!window.confirm('Delete selection?')) {
    return;
  }
  for (let i = 0; i < selectedRecordings.value.length; i++) {
    const rec = selectedRecordings.value[i];
    await api.recordings.recordingsDelete(rec.recordingId);
    const j = channel.value?.recordings?.findIndex(r => r.filename === rec.filename);
    if (j && j !== -1) {
      channel.value?.recordings?.splice(j, 1);
    }
  }
  selectedRecordings.value = [];
};

const selectRecording = (data: { checked: boolean, recording: RecordingResponse }) => {
  if (data.checked) {
    selectedRecordings.value.push(data.recording);
  } else {
    const i = selectedRecordings.value.findIndex(rec => rec.filename === data.recording.filename);
    if (i !== -1) {
      selectedRecordings.value.splice(i, 1);
    }
  }
};

const deleteChannel = () => {
  if (window.confirm(`Delete channel "${channelId}"?`)) {
    api.channels.channelsDelete(channelId)
        .then(() => store.commit('destroyChannel', channelId))
        .finally(() => router.back());
  }
};

const cancelUpload = () => {
  if (cancellationToken) {
    cancellationToken.cancel();
  }
  modal.value!.hide();
};

const submit = () => {
  const el = file as unknown as HTMLInputElement;
  if (el.files && el.files!.length > 0) {
    uploadProgress.value = 0;
    modal.value!.show();
    const [ req, cancelToken ] = api.channelUpload(channelId, el.files![0], pcent => uploadProgress.value = pcent);
    req.then(res => {
      uploadProgress.value = 0;
      channel.value?.recordings?.unshift(res.data);
      cancellationToken = null;
      modal.value!.hide();
      // clear old file
      el.value = '';
    }).catch(res => {
      alert(res.error);
      modal.value!.hide();
    });
    cancellationToken = cancelToken;
  }
};

const destroyRecording = (recording: RecordingResponse) => {
  if (channel.value?.recordings) {
    for (let i = 0; i < channel.value?.recordings?.length; i += 1) {
      if (channel.value?.recordings && channel.value?.recordings[i].recordingId === recording.recordingId) {
        channel.value?.recordings?.splice(i, 1);
        break;
      }
    }
  }
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  try {
    modal.value = new Modal(upload.value as unknown as HTMLElement);
    busy.value = true;

    const response = await api.channels.channelsDetail(channelId);
    channel.value = response.data;
    busy.value = false;

    window.scrollTo(0, 0);
  } finally {
    busy.value = false;
  }
});
</script>

<style scoped>
</style>