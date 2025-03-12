<template>
  <div class="position-relative">
    <span class="recording-indicator position-absolute">
      <i class="bi fs-4 text-danger blink bi-record-fill pulse" v-if="props.isRecording"></i>
    </span>
    <img class="w-100 h-auto" alt="preview" :src="props.previewImage" v-if="!props.previewVideo || props.previewVideo?.endsWith('null')"/>
    <video v-else ref="video" loop muted playsinline
           class="w-100 h-auto"
           style="user-select: none; z-index: 0;"
           :poster="props.previewImage"
           @click="emit('selected', props.data)"
           @contextmenu="context($event)"
           @error="errorLoadImage"
           @mouseleave="leaveVideo()"
           @mouseover="hoverVideo()"
           @touchend="leaveVideo()"
           @touchstart="hoverVideo()">
      <source :src="previewVideo">
    </video>
    <span v-if="isRecording" class="recording-time-overlay bg-danger position-absolute badge rounded-2 opacity-75 text-white">
      {{ minutes }}:{{ seconds }}min
    </span>
    <span class="channel-info-overlay bg-dark position-absolute badge rounded-2 opacity-75 text-white" v-if="props.recordingsSize && props.recordingsCount">
    {{ (props.recordingsSize / 1024 / 1024 / 1024).toFixed(1) }}GB ({{ props.recordingsCount }})
  </span>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref, computed, onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{ (e: 'selected', value: string | number): void }>();

const video = useTemplateRef<HTMLVideoElement>('video');
const thread = ref<null | ReturnType<typeof setTimeout>>(null);

const errorLoad = ref(false);

const props = defineProps<{
  minRecording?: number;
  recordingsSize?: number;
  recordingsCount?: number;
  isRecording?: boolean;
  data: string | number
  previewImage?: string
  previewVideo?: string
}>();

const secRecording = ref((props.minRecording || 0) * 60);

const minutes = computed(() => (secRecording.value / 60).toFixed(0));
const seconds = computed(() => {
  const x = (secRecording.value % 60).toFixed(0);
  return x.length < 2 ? '0' + String(x) : x;
});

const context = (e: Event) => e.preventDefault();

const hoverVideo = async () => {
  if (video.value) {
    video.value.playbackRate = 16;
    await video.value.play();
    video.value?.removeAttribute('poster');
  }
};

const leaveVideo = () => video.value?.pause();

const errorLoadImage = () => errorLoad.value = true;

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(() => {
  if (props.isRecording) {
    // Increase the seconds to indicate liveness.
    thread.value = setInterval(() => {
      secRecording.value += 1;
    }, 1000);
  }
});

onUnmounted(() => {
  if (props.isRecording && thread.value) {
    clearInterval(thread.value);
  }
});
</script>

<style scoped>
.preview-container img, .preview-container video {
  width: 100%;
  height: auto;
  vertical-align: middle;
  z-index: -1;
}

video.missing {
  filter: blur(4px);
  clip-path: inset(0);
}

.recording-indicator {
  top: 1%;
  left: 5%;
}

.channel-info-overlay {
  bottom: 5%;
  right: 5%;
  z-index: 1;
}

.recording-time-overlay {
  bottom: 5%;
  left: 5%;
  z-index: 1;
}
</style>
