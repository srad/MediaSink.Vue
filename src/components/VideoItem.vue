<template>
  <div style="z-index: 10" class="card bg-light border position-relative shadow-sm bg-light mark p-0 rounded-top-2" :class="{ 'border-info': !checked, 'animate__animated animate__zoomOut': destroyed, 'border-2 border-danger': checked }">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>
    <div class="position-relative">
      <div class="position-absolute" style="padding: 10px; right: 0; top: 0; z-index: 10">
        <input v-if="props.showSelection" v-model="checked" type="checkbox" :checked="checked" style="width: 20px; height: 20px" />
      </div>
      <span class="badge bg-success position-absolute rounded-2" style="user-select: none; z-index: 10; top: 10px; left: 10px; opacity: 0.6">
        <span v-if="props.recording.width === 1920">1080p</span>
        <span v-else-if="props.recording.width === 2560">1440p</span>
        <span v-else-if="props.recording.width === 1280">720p</span>
        <span v-else-if="props.recording.width === 3840">4k</span>
        <span v-else>{{ props.recording.width }}x{{ props.recording.height }}</span>
      </span>
      <div class="position-absolute badge bg-danger" v-if="props.job" style="user-select: none; z-index: 10; bottom: 10px; left: 10px; opacity: 0.7">
        <span class="me-1 spinner-border spinner-border-sm" style="height: 0.6rem; width: 0.6rem" role="status"></span>
        <span>Job active</span>
      </div>
      <span v-if="props.recording.videoType === 'cut'" class="badge bg-warning position-absolute" style="user-select: none; z-index: 10; bottom: 10px; right: 10px">cut</span>
      <RouterLink class="d-flex" :to="link">
        <VideoPreview class="card-img-top" :data="recording.recordingId" :preview-video="previewVideoUrl" :preview-image="previewCoverUrl" />
      </RouterLink>
    </div>
    <div v-if="props.showTitle" class="card-body">
      <div class="card-title p-1 m-0 bg-primary" style="cursor: pointer" @click="router.push(`/channel/${props.recording.channelId}/${props.recording.channelName}`)">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank">
            {{ props.recording.channelName }}
          </a>
        </h6>
      </div>
    </div>
    <VideoInfo
      :disable-buttons="props.job !== null"
      :duration="props.recording.duration"
      :size="props.recording.size"
      :url="downloadApiUrl"
      :bit-rate="props.recording.bitRate"
      :bookmark="props.recording.bookmark"
      :created-at="props.recording.createdAt"
      :data="recording"
      :width="props.recording.width"
      :height="props.recording.height"
      @convert="convert"
      @bookmarked="bookmark"
      @preview="generatePreview"
      @destroy="destroyRecording" />
  </div>
</template>

<script setup lang="ts">
import VideoInfo from "./VideoInfo.vue";
import VideoPreview from "./VideoPreview.vue";
import type { DatabaseRecording as RecordingResponse } from "../services/api/v1/MediaSinkClient";
import { watch, ref, inject } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { createClient } from "../services/api/v1/ClientFactory";

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: "destroyed", value: RecordingResponse): void;
  (e: "checked", value: { checked: boolean; recording: RecordingResponse }): void;
  (e: "bookmark", value: RecordingResponse): void;
}>();

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  select?: boolean;
  showSelection: boolean;
  showTitle: boolean;
  check?: boolean;
  job?: string | null;
  recording: RecordingResponse;
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const checked = ref(props.check);
const busy = ref(false);
const destroyed = ref(false);

const apiUrl = inject("apiUrl") as string;
const fileUrl = inject("fileUrl") as string;

const previewVideoUrl = `${fileUrl}/${props.recording.previewVideo}`;
// TODO: Pass a default image from the server, if the preview image is missing.
const previewCoverUrl = `${fileUrl}/${props.recording.previewCover || props.recording.channelName + "/.previews/live.jpg"}`;
const downloadApiUrl = `${apiUrl}/videos/${props.recording.recordingId}/download`;

const { t } = useI18n();

const link = `/recordings/${props.recording.recordingId}`;

const router = useRouter();

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(
  () => props.check,
  (isChecked: boolean) => {
    checked.value = isChecked;
  },
);

watch(checked, (val) => {
  emit("checked", { checked: val, recording: props.recording });
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const bookmark = async (recording: RecordingResponse, yesNo: boolean) => {
  try {
    busy.value = true;
    const client = createClient();
    const method = yesNo ? client.videos.favPartialUpdate : client.videos.unfavPartialUpdate;
    await method(recording.recordingId);
    recording.bookmark = yesNo;
    emit("bookmark", recording);
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};

const generatePreview = async (recording: RecordingResponse) => {
  if (window.confirm("Generate new preview?")) {
    try {
      busy.value = true;
      const client = createClient();
      await client.videos.previewCreate(recording.recordingId);
    } catch (ex) {
      alert(ex);
    } finally {
      busy.value = false;
    }
  }
};

const convert = async ({ recording, mediaType }: { recording: RecordingResponse; mediaType: string }) => {
  if (!window.confirm(`Convert '${recording.filename}' video to type '${mediaType}'?`)) {
    return;
  }

  try {
    busy.value = true;
    const client = createClient();
    await client.videos.convertCreate(recording.recordingId, mediaType);
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};

const destroyRecording = async (recording: RecordingResponse) => {
  if (!window.confirm(t("crud.destroy", [recording.filename]))) {
    return;
  }

  try {
    busy.value = true;
    const client = createClient();
    await client.videos.videosDelete(recording.recordingId);
    destroyed.value = true;
    setTimeout(() => emit("destroyed", recording), 1000);
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};
</script>

<style scoped>
.mark:hover {
  outline: #da420d 2px solid;
}
</style>
