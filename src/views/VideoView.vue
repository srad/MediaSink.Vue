<template>
  <div v-if="recording">
    <ModalConfirmDialog :show="showConfirmDialog" @cancel="showConfirmDialog = false" @confirm="cutVideo">
      <template v-slot:header>
        <span class="fs-5">Confirm your video cut</span>
      </template>
      <template v-slot:body>
        <MarkingsTable v-if="showConfirmDialog" :show-destroy="false" :markings="markings" @destroy="(marking: Marking) => destroyMarking(marking)" @selected="(marking: Marking) => selectMarking(marking)"/>

        <hr/>

        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" v-model="deleteFileAfterCut"/>
          <label class="form-check-label" for="flexSwitchCheckDefault">Delete file after cut?</label>
        </div>
      </template>
    </ModalConfirmDialog>

    <BusyOverlay :visible="busy"></BusyOverlay>

    <div class="d-flex flex-column bg-light vh-100 w-100">
      <div class="d-flex flex-row vh-100 w-100">
        <div class="w-100 d-flex flex-column">
          <div class="flex-grow-1 bg-info-subtle">
            <video style="outline: none" controls ref="video" @volumechange="volumeChanged($event)" @loadeddata="loadData" @timeupdate="timeupdate" :muted="isMuted" @seeked="() => seeked = video!.currentTime" autoplay>
              <source :src="videoUrl" type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
          </div>
          <div class="d-flex align-items-center justify-content-between w-100 d-none d-lg-flex p-1 bg-secondary" style="height: 50px">
            <div>
              <button class="btn btn-danger" @click="destroy">
                <span>Delete</span>
              </button>
            </div>

            <div class="d-flex">
              <div class="me-2 d-flex">
                <button class="btn btn-info me-1" @click="back" type="button">
                  <i class="bi bi-zoom-out"/>
                </button>
                <button class="btn btn-info me-1" @click="back" type="button">
                  <i class="bi bi-zoom-in"/>
                </button>
              </div>

              <div class="d-flex">
                <button class="btn btn-primary me-1" @click="back" type="button">
                  <i class="bi bi-chevron-left"/>
                </button>

                <button class="btn btn-primary" @click="forward" type="button">
                  <i class="bi bi-chevron-right"/>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="editMode||true" class="d-none d-lg-flex flex-column p-2 border-start border-primary ms-2" style="width: 350px">
          <MarkingsTable :show-destroy="true" :markings="markings" @destroy="(marking: Marking) => destroyMarking(marking)" @selected="(marking: Marking) => selectMarking(marking)"/>

          <button class="btn btn-primary" @click="playCut" v-if="!playingCut">Play Cut <i class="bi bi-play-fill"></i></button>
          <button v-else class="btn btn-primary" @click="stopCut"><span>Stop cut</span> <i class="bi bi-stop-fill"></i></button>

          <button v-if="editMode" class="btn my-2 btn-warning" type="button" @click="showConfirmDialog = true">{{ t("videoView.button.cut") }} <i class="bi bi-scissors"></i></button>
        </div>
      </div>
      <!-- Strip -->
      <div class="w-100" style="height: 20%; max-height: 150px">
        <VideoStripe
          :loaded="isLoaded"
          :src="stripeUrl"
          :disabled="playingCut"
          :seeked="seeked"
          :paused="pause"
          :timecode="timeCode"
          :duration="duration"
          :markings="markings" @selecting="() =>  pause = true"
          @marking="(m) => (markings = m)"
          @seek="seek"
        />
      </div>
    </div>

    <div v-if="false" class="modal show m-0 p-0m position-absolute" tabindex="-1" style="display: block !important">
      <div class="modal-dialog modal-fullscreen p-0">
        <div class="modal-content">
          <template v-if="recording">
            <div class="modal-body bg-light p-0 m-0 d-flex flex-column" style="overflow: hidden">
              <div class="d-flex flex-row vh-100">
                <div class="d-flex flex-column m-0 position-relative" :class="{ 'w-80': editMode, 'w-100': markings.length === 0 }">

                  <button style="top: 5px; left: 5px;" type="button" class="btn btn-sm btn-outline-info position-absolute" @click="router.push(`/channel/${recording.channelId}/${recording.channelName}`)">
                    {{ recording.channelName }}
                  </button>

                  <div class="fs-4 position-absolute" style="top: 10px; right: 20px;">
                    <RecordingFavButton :bookmarked="recording.bookmark" :recording-id="recording.recordingId"/>
                  </div>

                  <video class="view h-100" style="outline: none" controls ref="video" @volumechange="volumeChanged($event)" @loadeddata="loadData" @timeupdate="timeupdate" :muted="isMuted" @seeked="() => seeked = video!.currentTime" autoplay>
                    <source :src="videoUrl" type="video/mp4"/>
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div v-if="editMode" class="d-flex flex-column m-0 border-start border-primary px-2 ms-2 py-2" :class="{ 'w-20': editMode }">
                  <MarkingsTable :show-destroy="true" :markings="markings" @destroy="(marking: Marking) => destroyMarking(marking)" @selected="(marking: Marking) => selectMarking(marking)"/>

                  <button class="btn btn-primary" @click="playCut" v-if="!playingCut">Play Cut <i class="bi bi-play-fill"></i></button>
                  <button v-else class="btn btn-primary" @click="stopCut"><span>Stop cut</span> <i class="bi bi-stop-fill"></i></button>

                  <button v-if="editMode" class="btn my-2 btn-warning" type="button" @click="showConfirmDialog = true">{{ t("videoView.button.cut") }} <i class="bi bi-scissors"></i></button>
                </div>
              </div>
              <div v-if="editMode" style="height: 10%">

              </div>

              <div class="w-100" style="height: 10%">
                <VideoStripe
                  :loaded="isLoaded"
                  :src="stripeUrl"
                  :disabled="playingCut"
                  :seeked="seeked"
                  :paused="pause"
                  :timecode="timeCode"
                  :duration="duration"
                  :markings="markings" @selecting="() =>  pause = true"
                  @marking="(m) => (markings = m)"
                  @seek="seek"
                />
              </div>
            </div>

            <div class="modal-footer p-1 d-flex justify-content-between" v-if="stripeUrl && !editMode">
              <div>
                <button class="btn btn-danger btn-sm me-2" @click="destroy">
                  <i class="bi bi-trash3-fill"/>
                </button>
              </div>
              <div class="d-flex justify-content-end overflow-y-scroll" style="max-width: 50%">
                <span class="mx-2 text-secondary">|</span>

                <button class="btn btn-primary btn-sm me-2" @click="back">
                  <i class="bi bi-chevron-left"/>
                </button>

                <button class="btn btn-primary btn-sm me-2" @click="forward">
                  <i class="bi bi-chevron-right"/>
                </button>

                <!--
                              <div class="fw-6 me-2">
                  {{ durationMin }}/{{ (timecode / 60).toFixed(2) }}min
                </div>

                <button v-if="!muted" class="btn btn-primary btn-sm me-2" type="button" @click="muted=true">
                  <i class="bi bi-volume-up"/>
                </button>

                <button v-else class="btn btn-outline-primary btn-sm me-2" type="button" @click="muted=false">
                  <i class="bi bi-volume-mute"/>
                </button>

                <button v-if="paused" class="btn btn-warning btn-sm" type="button" @click="play()">
                  <i class="bi bi-play"></i>
                </button>
                <button v-else class="btn btn-success btn-sm" type="button" @click="pause()">
                  <i class="bi bi-pause"></i>
                </button>
                -->
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseRecording } from "@/services/api/v1/StreamSinkClient";
import VideoStripe from "@/components/VideoStripe.vue";
import RecordingFavButton from "@/components/controls/RecordingFavButton.vue";
import BusyOverlay from "@/components/BusyOverlay.vue";
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ModalConfirmDialog from "@/components/modals/ModalConfirmDialog.vue";
import MarkingsTable from "@/components/MarkingsTable.vue";
import { useToastStore } from "@/stores/toast";
import { useJobStore } from "@/stores/job";
import type { Marking } from "@/types/appTypes";
import { createClient } from "@/services/api/v1/ClientFactory";
import { useSettingsStore } from "@/stores/settings.ts";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const jobStore = useJobStore();
const toastStore = useToastStore();
const settingsStore = useSettingsStore();

const video = ref<HTMLVideoElement>();

const fileUrl = inject("fileUrl") as string;
const stripeUrl = ref("");
const videoUrl = ref("");

const seeked = ref(0);
const isMuted = ref(settingsStore.isMuted);
const isMounted = ref(false);
const pause = ref(false);
const isLoaded = ref(false);
const isShown = ref(false);
const playbackSpeed = ref(1.0);
const markings = ref<Marking[]>([]);
const timeCode = ref<number>(0);
const duration = ref<number>(0);
const recording = ref<DatabaseRecording | null>(null);
const id = ref<number | null>(null);
const busy = ref(false);
const showConfirmDialog = ref(false);
const deleteFileAfterCut = ref(false);

const playingCut = ref(false);

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const editMode = computed(() => markings.value.length > 0);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(isMuted, (val) => {
  if (isMounted.value && video.value) {
    video.value.muted = val;
  }
});

watch(pause, async (val) => {
  if (isMounted.value && video.value) {
    const vid = video.value;

    if (val) {
      vid.pause();
    } else {
      await vid.play();
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

const back = () => (video.value!.currentTime = (video.value?.currentTime || 0) - 30);
const forward = () => (video.value!.currentTime = (video.value?.currentTime || 0) + 30);

const stopCut = () => {
  pause.value = true;
  playingCut.value = false;
};

const volumeChanged = (event: Event) => {
  const isMuted = (event.target as HTMLVideoElement).muted;
  if (isMuted) {
    settingsStore.mute();
  } else {
    settingsStore.unmute();
  }
  settingsStore.setVolume((event.target as HTMLVideoElement).volume);
};

const playCut = () => {
  if (markings.value.length == 0) {
    return;
  }

  let i = 0;

  const timeUpdate = () => {
    if (!markings.value[i] || !playingCut.value) {
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

const selectMarking = (marking: Marking) => {
  resetSelection();
  video.value!.currentTime = marking.timestart;
  marking.selected = true;
};

const destroyMarking = (marking: Marking) => {
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

  if (!window.confirm(t("videoView.destroy", [ recording.value.filename ]))) {
    return;
  }

  busy.value = true;

  unloadVideo();

  const client = createClient();
  client.recordings
    .recordingsDelete(recording.value.recordingId)
    .then(() => {
      // Remove from Job list if existent.
      jobStore.deleteRecording(recording.value!.recordingId);
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

  client.recordings
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

const loadData = () => {
  if (isMounted.value && video.value) {
    duration.value = video.value.duration;
    isLoaded.value = true;
    video.value.volume = settingsStore.getVolume;
    video.value.focus(); // Allows using key controls for the video immediately. Including forward+rewind with the left/right keys.
    pause.value = false;
  }
};

const timeupdate = () => {
  if (isMounted.value && video.value) {
    timeCode.value = video.value.currentTime;
  }
};

const unloadVideo = () => {
  if (isMounted.value && video.value) {
    video.value.pause();
    video.value.firstElementChild!.removeAttribute("src");
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

onUnmounted(() => {
  window.removeEventListener("orientationchange", rotate);
});

onMounted(async () => {
  const client = createClient();
  id.value = Number(route.params.id);
  const data = await client.recordings.recordingsDetail(id.value);
  recording.value = data;
  stripeUrl.value = fileUrl + "/" + recording.value?.previewStripe;
  videoUrl.value = fileUrl + "/" + recording.value?.pathRelative;

  window.addEventListener("orientationchange", rotate);
  isMounted.value = true;
  isShown.value = true;
});
</script>
