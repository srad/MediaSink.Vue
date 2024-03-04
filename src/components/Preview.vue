<template>
  <div class="preview-container">
    <svg v-if="errorLoad" width="100%" height="100%" @click="$emit('selected', data)">
      <rect width="100%" height="100%" fill="lightgrey"/>
      <text x="50%" y="50%" font-size="1.5em" text-anchor="middle">No Preview</text>
    </svg>
    <img v-if="image && !errorLoad"
         :src="image"
         alt="preview"
         @error="errorLoadImage($event)"
         @click="$emit('selected', data)"/>
    <video v-if="!image"
           style="user-select: none; z-index: -1"
           @error="errorLoadImage"
           @contextmenu="context($event)"
           loop muted playsinline
           @click="$emit('selected', data)"
           @touchstart="hoverVideo($event)"
           @touchend="leaveVideo($event)"
           @mouseover="hoverVideo($event)"
           @mouseleave="leaveVideo($event)">
      <source :src="previewVideo">
    </video>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'streamsink-preview',
  inject: ['fileUrl'],
  emits: ['selected'],
  data() {
    return {
      errorLoad: false
    };
  },
  props: {
    data: Object,
    image: String,
    previewVideo: String,
  },
  methods: {
    context(e: any) {
      e.preventDefault();
    },
    hoverVideo(event: any) {
      event.target.playbackRate = 16;
      event.target.play();
    },
    leaveVideo(event: any) {
      event.target.pause();
    },
    errorLoadImage(event: Event) {
      this.errorLoad = true;
    },
  }
});
</script>

<style lang="scss" scoped>
.preview-container img, .preview-container video {
  //position: relative;
  width: 100%;
  height: auto;
  vertical-align: middle;
  z-index: -1;
}
</style>
