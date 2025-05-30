<template>
  <div>
    <BusyOverlay :visible="busyOverlay" />

    <JsConfirmDialog :show="showConfirm" @cancel="showConfirm = false" @confirm="deleteChannel" text="Are you sure you want to delete this channel?" />

    <ModalConfirmDialog :show="showDeleteSelectedRecordings" @cancel="showDeleteSelectedRecordings = false" @confirm="destroySelection">
      <template v-slot:header>Confirm selection</template>
      <template v-slot:body>
        <ul class="list-unstyled">
          <li :key="recording.recordingId" v-for="recording in selectedRecordings" class="list-group-item d-flex justify-content-between mb-2">
            <img class="img-thumbnail w-20 me-2" :alt="recording.filename" loading="lazy" :src="`${fileUrl}/${recording.previewCover || recording.channelName + '/.previews/live.jpg'}`" />
            <div class="w-80">
              <div>{{ recording.filename }}</div>
              <div>{{ (recording.duration / 60).toFixed(1) }}min - {{ Math.fround(recording.size / 1024 / 1024 / 1024).toFixed(1) }}GB</div>
            </div>
          </li>
        </ul>
      </template>
    </ModalConfirmDialog>

    <LoadIndicator :busy="!channel">
      <div ref="upload" style="display: none" class="modal modal-dialog modal-dialog-centered" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Uploading Video</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <h5>Progress: {{ (uploadProgress * 100).toFixed(0) }}%</h5>
              <div class="progress">
                <div class="progress-bar progress-bar-animated progress-bar-striped bg-warning" role="progressbar" :style="{ width: `${uploadProgress * 100}%` }" aria-valuemax="1" aria-valuemin="0" aria-valuenow="0.4"></div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-warning" @click="cancelUpload">Cancel Upload</button>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center mb-3 justify-content-between border-bottom pb-2">
        <div class="text-info fs-5 fw-bolder d-none d-sm-inline">{{ channel!.displayName }}</div>

        <div class="d-flex gap-2 align-items-center">
          <OptionsMenu v-if="!areItemsSelected" :channel-paused="channel!.isPaused" :multi-select="selectedRecordings.length === 0" @file="fileSelected" @pause="pauseChannel" @delete="showConfirm = true" />

          <div class="d-flex gap-2 align-items-center">
            <button v-if="areItemsSelected" type="button" class="btn btn-sm btn-danger d-flex gap-2 justify-content-between" @click="showDeleteSelectedRecordings = true">
              <span>Delete selection</span>
              <i class="bi bi-trash3-fill" />
            </button>
            <button v-if="selectedRecordings.length > 1" type="button" class="btn d-flex gap-2 btn-sm btn-info justify-content-between" @click="mergeVideos">
              <span>Merge</span>
              <i class="bi bi-sign-merge-left" />
            </button>
            <button v-if="areItemsSelected" type="button" class="btn gap-2 d-flex btn-sm btn-info justify-content-between" @click="cancelSelection">
              <span>Cancel</span>
              <i class="bi bi-stop-fill" />
            </button>
            <FavButton v-if="!areItemsSelected" :faved="channel!.fav" :data="channel" @fav="bookmark" @unfav="bookmark" />
          </div>
        </div>

        <div class="d-flex gap-2 align-items-center fs-5 d-none d-sm-inline">
          <button type="button" class="btn btn-sm me-1 btn-secondary" disabled>
            <span>Count:</span>
            <span>{{ channel!.recordingsCount }}</span>
          </button>
          <button type="button" class="btn btn-sm btn-secondary" disabled>Size: {{ (channel!.recordingsSize! / 1024 / 1024 / 1024).toFixed(1) }}GB</button>
        </div>
      </div>

      <div class="row mb-5">
        <div v-for="recording in recordings" :key="recording.recordingId" class="mb-3 col-lg-6 col-xl-6 col-xxl-4 col-md-8 col-sm-8">
          <VideoItem :job="jobStore.isProcessing(recording.recordingId)" @destroyed="destroyRecording" :check="selectedRecordings.some((x: RecordingResponse) => x.recordingId === recording.recordingId)" @checked="selectRecording" :show-selection="true" :recording="recording" :show-title="false" />
        </div>
      </div>
    </LoadIndicator>
  </div>
</template>

<script setup lang="ts">
import VideoItem from "../components/VideoItem.vue";
import type { DatabaseRecording, DatabaseRecording as RecordingResponse, ServicesChannelInfo } from "../services/api/v1/MediaSinkClient";
import { computed, inject, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MessageType, SocketManager } from "../utils/socket";
import BusyOverlay from "../components/BusyOverlay.vue";
import { useToastStore } from "../stores/toast";
import { useChannelStore } from "../stores/channel";
import { useJobStore } from "../stores/job";
import OptionsMenu from "@/components/controls/OptionsMenu.vue";
import ModalConfirmDialog from "@/components/modals/ModalConfirmDialog.vue";
import { createClient } from "@/services/api/v1/ClientFactory";
import LoadIndicator from "@/components/LoadIndicator.vue";
import JsConfirmDialog from "@/components/modals/JsConfirmDialog.vue";
import FavButton from "@/components/controls/FavButton.vue";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const route = useRoute();
const router = useRouter();

const jobStore = useJobStore();
const toastStore = useToastStore();
const channelStore = useChannelStore();

// Elements
const upload = useTemplateRef<HTMLDivElement>("upload");

const channelId = +route.params.id as number;

const channel = ref<ServicesChannelInfo | null>(null);
const selectedRecordings = ref<RecordingResponse[]>([]);
const uploadProgress = ref(0);
const busyOverlay = ref(false);

let uploadAbortController: AbortController | null = null;

const showModal = ref(false);
const showConfirm = ref(false);
const showDeleteSelectedRecordings = ref(false);

const fileUrl = inject("fileUrl");

const socketManager = new SocketManager();

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const areItemsSelected = computed(() => selectedRecordings.value.length > 0);

const recordings = computed(() => {
  if (channel.value && channel.value.recordings) {
    return [...channel.value.recordings] // Avoid mutating original array
      .sort((a, b) => b.videoType.localeCompare(a.videoType))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
  return [];
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const pauseChannel = (element: HTMLInputElement): void => {
  const client = createClient();
  const fn = element.checked ? client.channels.resumeCreate : client.channels.pauseCreate;
  fn(channel.value!.channelId)
    .then(() => {
      if (element.checked) {
        channelStore.resume(channel.value!.channelId);
      } else {
        channelStore.pause(channel.value!.channelId);
      }
      toastStore.info({
        title: element.checked ? "Channel resume" : "Channel pause",
        message: `Channel ${channel.value?.displayName}`,
      });
    })
    .catch((res) => alert((<{ error: string }>res).error));
};

const cancelSelection = () => (selectedRecordings.value = []);

const destroySelection = async () => {
  try {
    const client = createClient();

    for (let i = 0; i < selectedRecordings.value.length; i++) {
      const rec = selectedRecordings.value[i] as RecordingResponse;
      await client.videos.videosDelete(rec.recordingId);
      const index = channel.value?.recordings?.findIndex((x: DatabaseRecording) => x.recordingId === rec.recordingId);
      if (index && index !== -1) {
        channel.value?.recordings?.splice(index, 1);
      }
    }
    // Clear selection.
    toastStore.success({
      title: "Deleted recordings",
      message: `Deleted ${selectedRecordings.value.length} files.`,
    });
    selectedRecordings.value = [];
  } catch (e) {
    toastStore.error({ title: "Deletion failed", message: (<{ message: string }>e).message });
  } finally {
    showDeleteSelectedRecordings.value = false;
  }
};

const selectRecording = ({ checked, recording }: { checked: boolean; recording: RecordingResponse }) => {
  if (checked && !selectedRecordings.value.some((x) => x.recordingId === recording.recordingId)) {
    selectedRecordings.value.push(recording);
  } else {
    selectedRecordings.value = selectedRecordings.value.filter((x) => x.recordingId !== recording.recordingId);
  }
};

const deleteChannel = async () => {
  try {
    busyOverlay.value = true;
    const client = createClient();
    await client.channels.channelsDelete(channelId);
    channelStore.destroy(channelId);
    toastStore.success({
      title: "Channel deleted",
      message: `Channel ${channel.value?.displayName}`,
    });
    await router.replace("/");
  } catch (e) {
    alert(e);
  } finally {
    busyOverlay.value = false;
  }
};

const cancelUpload = () => {
  if (uploadAbortController) {
    uploadAbortController.abort();
  }
  showModal.value = false;
};

const fileSelected = async (file: File) => {
  try {
    uploadProgress.value = 0;
    showModal.value = true;
    const client = createClient();
    const [req, abortController] = client.channelUpload(channelId, file, (pcent: number) => (uploadProgress.value = pcent));
    uploadAbortController = abortController;
    const recording = await req;
    uploadProgress.value = 0;
    channel.value?.recordings?.unshift(recording);
    uploadAbortController = null;
    showModal.value = false;
  } catch (e) {
    alert(e);
    showModal.value = false;
  }
};

const destroyRecording = (recording: RecordingResponse) => {
  if (channel.value?.recordings) {
    for (let i = 0; i < channel.value.recordings.length; i += 1) {
      if (channel.value.recordings && channel.value?.recordings[i]!.recordingId === recording.recordingId) {
        jobStore.destroy(recording.recordingId);
        channel.value?.recordings?.splice(i, 1);
        break;
      }
    }
  }
};

const bookmark = () => {
  const client = createClient();
  const fn = channel.value!.fav ? client.channels.unfavPartialUpdate : client.channels.favPartialUpdate;

  fn(channel.value!.channelId)
    .then(() => (channel.value!.fav = !channel.value!.fav))
    .catch((err) => alert(err));
};

const mergeVideos = async () => {
  // TODO: call merge videos api.
  alert(selectedRecordings.value.map((x) => x.filename).join(", "));
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onUnmounted(() => {
  channel.value = null; // Force release memory
  selectedRecordings.value = [];
  socketManager.close();
});

onMounted(async () => {
  try {
    const client = createClient();
    const data = await client.channels.channelsDetail(channelId);

    if (!data) {
      await router.replace("/streams/live");
      return;
    }

    channel.value = data;

    await socketManager.connect();

    socketManager.on(MessageType.RecordingAdd, (recording) => {
      const r = recording as RecordingResponse;
      channelStore.addRecording(r);
    });

    window.scrollTo(0, 0);
  } catch (error) {
    alert((<{ error: string }>error).error);
    router.back();
  }
});
</script>
