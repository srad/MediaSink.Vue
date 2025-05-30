/** * @file VideoView.vue * @description This component serves as a video playback and editing interface, * allowing users to view, cut, and manage recordings. Notice that this view uses a different layout than other routes. */

<template>
  <ModalConfirmDialog :show="showConfirmDialog" @cancel="showConfirmDialog = false" @confirm="cutVideo">
    <template v-slot:header>
      <span class="fs-5">Confirm your video cut</span>
    </template>
    <template v-slot:body>
      <MarkingsTable v-if="showConfirmDialog" :show-destroy="false" :markings="markings" @destroy="(marking: Selection) => destroyMarking(marking)" @selected="(marking: Selection) => selectMarking(marking)" />

      <hr />

      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" v-model="deleteFileAfterCut" />
        <label class="form-check-label" for="flexSwitchCheckDefault">Delete file after cut?</label>
      </div>
    </template>
  </ModalConfirmDialog>
  <BusyOverlay :visible="busy"></BusyOverlay>

  <template v-if="recording">
    <ModalWindow :show="showInfo" @close="showInfo=false" :show-footer="false">
      <template #header>
        Video Info
      </template>
      <template #body>
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>Resolution</strong>
            <span class="font-monospace">{{ recording.width }}x{{ recording.height }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>Duration</strong>
            <span class="font-monospace">{{ (recording.duration / 60).toFixed(1) }}min</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>File Size</strong>
            <span class="font-monospace">{{ (recording.size / 1024 / 1024 / 1024).toFixed(1) }}GB</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>Bitrate</strong>
            <span class="font-monospace">{{ (recording.bitRate / 1024 / 1024).toFixed(2) }} MBit</span>
          </li>
          <li class="list-group-item d-flex gap-2 justify-content-between align-items-center">
            <strong>File</strong>
            <br />
            <span class="text-ellipsis font-monospace">{{ recording.pathRelative }}</span>
          </li>
        </ul>
      </template>
    </ModalWindow>

    <div class="d-flex flex-column bg-light w-100 vh-100">
      <!-- Main Row: Video & Sidebar -->
      <div class="d-flex flex-row w-100 flex-grow-1 overflow-hidden">
        <div class="w-100 d-flex flex-column">
          <!-- Video Container: Takes remaining space -->
          <div class="d-flex flex-grow-1 overflow-hidden bg-dark position-relative">
            <video class="w-100 h-100" style="object-fit: contain; outline: none" ref="video" :muted="isMuted" @volumechange="volumeChanged($event)" @loadeddata="loadData" @timeupdate="timeupdate" @seeked="() => (seeked = video!.currentTime)" controls playsinline autoplay>
              <source :src="videoUrl" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div class="position-absolute fs-2" style="top: 10px; right: 70px">
              <a href="#" @click="showInfo=!showInfo">
                <i class="bi bi-info-circle" style="color: deepskyblue"></i>
              </a>
            </div>
            <div class="position-absolute fs-2" style="top: 10px; right: 20px">
              <RecordingFavButton :bookmarked="recording.bookmark" :recording-id="recording.recordingId" />
            </div>
          </div>

          <!-- Controls: Fixed height -->
          <div class="d-flex align-items-center justify-content-between w-100 p-1 bg-dark flex-shrink-0 border-top border-white" style="height: 40px">
            <div>
              <button class="btn btn-danger btn-sm me-1" @click="destroy">
                <span>Delete</span>
              </button>
              <RouterLink class="btn btn-sm btn-info" :to="`/channel/${recording.channelId}/${recording.channelName}`">Show Channel</RouterLink>
            </div>

            <div class="d-flex">
              <!-- zoom buttons -->
              <div v-if="false" class="me-2 d-flex">
                <button class="btn btn-info me-1" @click="back" type="button">
                  <i class="bi bi-zoom-out"></i>
                </button>
                <button class="btn btn-info me-1" @click="back" type="button">
                  <i class="bi bi-zoom-in"></i>
                </button>
              </div>

              <!-- back forth buttons -->
              <div class="d-flex">
                <button class="btn btn-info btn-sm me-1" @click="back" type="button">
                  <i class="bi bi-arrow-counterclockwise"></i>
                  {{ skipSeconds }}
                </button>

                <button class="btn btn-info btn-sm" @click="forward" type="button">
                  {{ skipSeconds }}
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div v-if="editMode" class="d-none d-lg-flex flex-column p-1 bg-secondary" style="width: 350px; font-size: 0.85rem">
          <MarkingsTable :show-destroy="true" :markings="markings" @destroy="(marking: Selection) => destroyMarking(marking)" @selected="(marking: Selection) => selectMarking(marking)" />

          <!-- Play cut controls
          <button class="btn btn-primary btn-sm" @click="playCut" v-if="!playingCut">Play Cut <i class="bi bi-play-fill"></i></button>
          <button v-else class="btn btn-sm btn-primary" @click="stopCut"><span>Stop cut</span> <i class="bi bi-stop-fill"></i></button>
          -->

          <button v-if="editMode" class="btn btn-sm my-2 btn-warning" type="button" @click="showConfirmDialog = true">
            {{ t("videoView.button.cut") }}
            <i class="bi bi-scissors"></i>
          </button>
        </div>
      </div>

      <!-- Video Stripe: Fixed height, always visible -->
      <div class="w-100 flex-shrink-0 bg-light position-relative" style="height: 20vh; max-height: 100px">
        <VideoSelector v-if="false" :image-src="stripeUrl" :duration="duration" />
        <VideoStripe :loaded="isLoaded" :src="stripeUrl" :disabled="playingCut" :seeked="seeked" :paused="pause" :timecode="timeCode" :duration="duration" :markings="markings" @selecting="() => (pause = true)" @marking="(m) => (markings = m)" @seek="seek" />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { DatabaseRecording } from "@/services/api/v1/MediaSinkClient";
import VideoStripe, { type Selection } from "@/components/VideoStripe.vue";
import BusyOverlay from "@/components/BusyOverlay.vue";
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ModalConfirmDialog from "@/components/modals/ModalConfirmDialog.vue";
import MarkingsTable from "@/components/MarkingsTable.vue";
import { useToastStore } from "@/stores/toast";
import { useJobStore } from "@/stores/job";
import { createClient } from "@/services/api/v1/ClientFactory";
import { useSettingsStore } from "@/stores/settings.ts";
import VideoSelector from "@/VideoSelector.vue";
import RecordingFavButton from "@/components/controls/RecordingFavButton.vue";
import ModalWindow from "@/components/modals/ModalWindow.vue";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const jobStore = useJobStore();
const toastStore = useToastStore();
const settingsStore = useSettingsStore();

const video = ref<HTMLVideoElement | null>(null);

const fileUrl = inject("fileUrl") as string;
const stripeUrl = ref("");
const videoUrl = ref("");

const  showInfo = ref(false);

const seeked = ref(0);
const isMuted = ref(settingsStore.isMuted);
const isMounted = ref(false);
const pause = ref(false);
const isLoaded = ref(false);
const isShown = ref(false);
const playbackSpeed = ref(1.0);
const markings = ref<Selection[]>([]);
const timeCode = ref<number>(0);
const duration = ref<number>(0);
const recording = ref<DatabaseRecording | null>(null);
const id = ref<number | null>(null);
const busy = ref(false);
const showConfirmDialog = ref(false);
const deleteFileAfterCut = ref(false);

const playingCut = ref(false);

const skipSeconds = 30;

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const editMode = computed(() => markings.value.length > 0);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(isMuted, (muted) => {
  if (muted) {
    settingsStore.mute();
  } else {
    settingsStore.unmute();
  }
});

watch(pause, async (val) => {
  if (isMounted.value && video.value) {
    if (val) {
      video.value.pause();
    } else if (video.value.paused) {
      await video.value.play();
    }
  }
});

watch(playbackSpeed, (val) => {
  if (isMounted.value && video.value) {
    video.value.playbackRate = val;
  }
});

// --------------------------------------------------------------------------------------
// Function
// --------------------------------------------------------------------------------------

const back = () => (video.value!.currentTime = (video.value?.currentTime || 0) - skipSeconds);
const forward = () => (video.value!.currentTime = (video.value?.currentTime || 0) + skipSeconds);

const stopCut = () => {
  pause.value = true;
  playingCut.value = false;
};

const volumeChanged = (event: Event) => {
  isMuted.value = video.value!.muted;
  settingsStore.updateVolume(video.value!.volume);
};

const playCut = () => {
  if (markings.value.length == 0) {
    return;
  }

  let i = 0;

  const timeUpdate = () => {
    if (i >= markings.value.length) {
      video.value!.removeEventListener("timeupdate", timeUpdate);
      pause.value = true;
      playingCut.value = false;
      return;
    }

    if (video.value!.currentTime >= markings.value[i].timeend) {
      i++;
      if (markings.value[i]) {
        timeCode.value = markings.value[i].timestart;
      }
      return;
    }
  };

  if (i >= markings.value.length) {
    video.value!.removeEventListener("timeupdate", timeUpdate);
    pause.value = true;
    playingCut.value = false;
    return;
  }

  timeCode.value = markings.value[i].timestart;
  video.value!.addEventListener("timeupdate", timeUpdate);
  playingCut.value = true;
  pause.value = false;
};

const resetSelection = () => {
  for (let i = 0; i < markings.value.length; i++) {
    markings.value[i]!.selected = false;
  }
};

const selectMarking = (marking: Selection) => {
  resetSelection();
  video.value!.currentTime = marking.timestart;
  marking.selected = true;
};

const destroyMarking = (marking: Selection) => {
  for (let i = 0; i < markings.value.length; i++) {
    if (markings.value[i]!.timestart === marking.timestart && markings.value[i]!.timeend === marking.timeend) {
      markings.value.splice(i, 1);
      break;
    }
  }
};

const destroy = () => {
  if (!recording.value) {
    return;
  }

  if (!window.confirm(t("videoView.destroy", [recording.value.filename]))) {
    return;
  }

  busy.value = true;

  unloadVideo();

  const client = createClient();
  client.videos
    .videosDelete(recording.value.recordingId)
    .then(() => {
      // Remove from Job list if existent.
      jobStore.destroy(recording.value!.recordingId);
      toastStore.success({ title: "Video deleted", message: recording.value!.filename });
      router.back();
    })
    .catch((err) => {
      alert(err);
    });
};

const cutVideo = () => {
  const client = createClient();
  const starts = markings.value.map((m) => String(m.timestart.toFixed(4)));
  const ends = markings.value.map((m) => String(m.timeend.toFixed(4)));

  client.videos
    .cutCreate(id.value!, {
      starts,
      ends,
      deleteAfterCut: deleteFileAfterCut.value,
    })
    .then(() => (markings.value = []))
    .catch((err) => alert(err))
    .finally(() => (showConfirmDialog.value = false));
};

const seek = (timeIndex: number) => {
  if (video.value) {
    video.value.currentTime = timeIndex;
  }
};

const loadData = async () => {
  if (isMounted.value && video.value) {
    duration.value = video.value.duration;
    isLoaded.value = true;
    video.value.volume = settingsStore.videoVolume;
    video.value.focus(); // Allows using key controls for the video immediately. Including forward+rewind with the left/right keys.
    pause.value = false;
  }
};

let lastUpdate = 0;
const timeupdate = () => {
  if (isMounted.value && video.value) {
    const now = performance.now();
    if (now - lastUpdate > 100) {
      // Update every 100ms instead of every frame
      timeCode.value = video.value.currentTime;
      lastUpdate = now;
    }
  }
};

const unloadVideo = () => {
  if (isMounted.value && video.value) {
    video.value.pause();
    video.value.src = "";
    video.value.load();
  }
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onBeforeRouteLeave(() => {
  if (video.value) {
    const el = video.value;
    el.pause();
    el.removeAttribute("src");
    el.load();
  }
  isShown.value = false;
});

const rotate = () => {
  const mql = window.matchMedia("(orientation: portrait)");

  if (mql.matches) {
    video.value!.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// Be careful if keep-alive components are using, then unmount is not collaed and causes memory but onmount is repeatedly.
onUnmounted(() => {
  window.removeEventListener("orientationchange", rotate);
});

onMounted(async () => {
  const client = createClient();
  id.value = Number(route.params.id);
  const data = await client.videos.videosDetail(id.value);
  recording.value = data;
  stripeUrl.value = fileUrl + "/" + recording.value?.previewStripe;
  videoUrl.value = fileUrl + "/" + recording.value?.pathRelative;

  window.removeEventListener("orientationchange", rotate); // Ensure no duplicate listeners
  window.addEventListener("orientationchange", rotate);

  isMounted.value = true;
  isShown.value = true;
});
</script>
