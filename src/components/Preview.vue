<template>
  <div class="preview-container">
    <svg v-if="errorLoad" width="100%" height="100%" @click="emit('selected', props.data)">
      <rect width="100%" height="100%" fill="lightgrey"/>
      <text x="50%" y="50%" font-size="1.5em" text-anchor="middle">No Preview</text>
    </svg>
    <img v-if="previewImage && !errorLoad"
         :src="previewImage"
         alt="preview"
         @error="errorLoadImage($event)"
         @click="emit('selected', props.data)"/>
    <video v-if="previewVideo"
           ref="video"
           style="user-select: none; z-index: -1"
           @error="errorLoadImage"
           @contextmenu="context($event)"
           loop muted playsinline
           @click="emit('selected', props.data)"
           @touchstart="hoverVideo($event)"
           @touchend="leaveVideo($event)"
           @mouseover="hoverVideo($event)"
           @mouseleave="leaveVideo($event)">
      <source :src="previewVideo">
    </video>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';

const emit = defineEmits<{ (e: 'selected', value: string | number): void }>();

const video = ref<HTMLVideoElement | null>(null);

const errorLoad = ref(false);

const props = defineProps<{
  data: string | number
  previewImage?: string
  previewVideo?: string
}>();

const context = (e: any) => e.preventDefault();

const hoverVideo = async (event: any) => {
  if (video.value) {
    video.value.playbackRate = 16;
    await video.value.play();
  }
};

const leaveVideo = (event: any) => video.value?.pause();

const errorLoadImage = (event: Event) => errorLoad.value = true;
</script>

<style scoped>
.preview-container img, .preview-container video {
  /*position: relative;*/
  width: 100%;
  height: auto;
  vertical-align: middle;
  z-index: -1;
}
</style>