<template>
  <div class="preview-container d-flex justify-content-center align-items-center" style="height: 165px">
    <div v-if="previewMissing">
      <LoadIndicator :busy="true"/>
      <div style="text-decoration: none !important;">Generating preview</div>
    </div>
    <video v-else
           :poster="previewImage"
           ref="video"
           style="user-select: none; z-index: 0;"
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
import LoadIndicator from "./LoadIndicator.vue";

const emit = defineEmits<{ (e: 'selected', value: string | number): void }>();

const video = ref<HTMLVideoElement | null>(null);

const errorLoad = ref(false);

const props = defineProps<{
  data: string | number
  previewImage?: string
  previewMissing?: boolean
  previewVideo?: string
}>();

const context = (e: any) => e.preventDefault();

const hoverVideo = async (event: any) => {
  if (video.value) {
    video.value.playbackRate = 16;
    await video.value.play();
    video.value?.removeAttribute('poster');
  }
};

const leaveVideo = (event: any) => video.value?.pause();

const errorLoadImage = (event: Event) => errorLoad.value = true;
</script>

<style scoped>
.preview-container img, .preview-container video {
  width: 100%;
  height: auto;
  vertical-align: middle;
  z-index: -1;
}
</style>