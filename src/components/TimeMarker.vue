<template>
  <div class="time-marker">
    <div class="progress m-0" v-for="(seg, i) in segments" :key="i" style="height: 0.2rem">
      <div class="progress-bar bg-danger" role="progressbar" @click="$emit('seek', seg)"
           :style="`width: ${(seg.end/duration*100)-(seg.start/duration*100)}%;margin-left: ${(seg.start/duration*100)}%`">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimeMarker",
  props: {
    duration: Number,
    segments: Array
  }
};
</script>

<style scoped>
.time-marker {
  width: 100%;
}
</style>
