<template>
  <div>
    <BusyOverlay :visible="busyOverlay"/>
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
      <div class="container-fluid justify-content-between">
        <!-- Default dropup button -->
        <div class="btn-group dropup">
          <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            Options
          </button>
          <ul class="dropdown-menu">
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between" @click="clickFile" v-if="selectedRecordings.length == 0">
                <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
                <span>Upload video</span>
                <i class="bi bi-upload"/>
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between">
                <span>Edit channel</span>
                <i class="bi bi-pencil"/>
              </button>
            </li>
          </ul>
        </div>

        <div class="btn-group">
          <button type="button" v-if="selectedRecordings.length > 0" class="btn btn-danger justify-content-between me-2" @click="destroySelection">
            <span class="me-2">Delete selection</span>
            <i class="bi bi-trash3-fill"/>
          </button>
          <button type="button" class="btn btn-danger d-flex justify-content-between me-2" @click="deleteChannel" v-if="selectedRecordings.length == 0">
            <span class="me-2">Delete channel</span>
            <i class="bi bi-trash3-fill"/>
          </button>
          <button type="button" class="btn d-flex justify-content-between" :class="{'btn-warning' : channel?.fav, 'btn-secondary' : !channel?.fav}" @click="bookmark">
            <span class="me-2">Bookmark</span>
            <i style="color: black" class="bi" :class="{'bi-star-fill' : channel?.fav, 'bi-star' : !channel?.fav}"/>
          </button>
        </div>
      </div>
    </nav>

    <div class="row my-1 mb-3">
      <div class="d-flex align-middle fs-5 pb-2 fw-bolder">
        <span class="text-primary">{{ $route.params.name }}</span>
      </div>

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
import { computed, ref, onMounted, nextTick } from 'vue';
import RecordingItem from '../components/RecordingItem.vue';
import { Modal } from 'bootstrap';
import LoadIndicator from '../components/LoadIndicator.vue';
import ChannelFavButton from "../components/controls/ChannelFavButton.vue";
import { createClient } from "../services/api/v1/ClientFactory";
import { ModelsRecording } from "../services/api/v1/StreamSinkClient";
import {
  ModelsChannel as ChannelResponse,
  ModelsRecording as RecordingResponse
} from "../services/api/v1/StreamSinkClient";
import { CancelTokenSource } from 'axios';
import { useRoute, useRouter } from "vue-router";
import { useStore } from "../store";
import { MessageType, socket } from "../utils/socket.ts";
import BusyOverlay from "../components/BusyOverlay.vue";

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
const busyOverlay = ref(false);
const channel = ref<ChannelResponse | null>(null);
const channelId = (+route.params.id) as unknown as number;

let cancellationToken: CancelTokenSource | null = null;

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

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
    busyOverlay.value = true;
    api.channels.channelsDelete(channelId)
        .then(() => store.commit('destroyChannel', channelId))
        .catch(err => alert(err))
        .finally(() => {
          busyOverlay.value = false;
          router.replace('/');
        });
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

const bookmark = () => {
  busy.value = true;
  const fn = channel.value!.fav ? api.channels.unfavPartialUpdate : api.channels.favPartialUpdate;

  fn(channel.value!.channelId)
      .then(() => channel.value!.fav = !channel.value!.fav)
      .catch(res => alert(res.error))
      .finally(() => busy.value = false);
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  socket.on(MessageType.RecordingAdd, recording => {
    const r = recording as ModelsRecording;
    console.log(r);
  });

  modal.value = new Modal(upload.value as unknown as HTMLElement);

  api.channels.channelsDetail(channelId).then(res => {
    busy.value = true;
    channel.value = res.data;
    window.scrollTo(0, 0);
  }).finally(() => busy.value = false);
});
</script>

<style scoped>
</style>