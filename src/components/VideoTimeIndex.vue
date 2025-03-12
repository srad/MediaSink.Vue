<template>
  <div class="position-relative time-index-container user-select-none" :style="{width: props.width + 'px'}">
    <div class="position-absolute time-index" v-for="marker in timeMarkers" :style="{left: marker.left + 'px' }">
      <div class="position-relative">
        <div class="position-relative">
          <div class="position-absolute" style="transform: translateX(-50%)">{{ marker.time }}</div>
          <div class="position-absolute m-0 p-0 border-end border-danger" style="height: 200px; transform: translate(-50%, -100%)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDurationToMMSS } from "../utils/time";

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{ duration: number, width: number }>();

// --------------------------------------------------------------------------------------
// computes
// --------------------------------------------------------------------------------------

const timeMarkers = computed(() => {
  const numberOfSegments = Math.floor(Math.floor(props.duration) / 60);
  const markerDistance = props.width / numberOfSegments;
  const timeDistance = props.duration / numberOfSegments;

  // Skip start and end marker.
  const result = new Array(numberOfSegments)
    .fill(0)
    .map((_, i) => ({ left: i * markerDistance, time: formatDurationToMMSS(timeDistance * i) }));

  result.push({ left: props.width - 30, time: formatDurationToMMSS(props.duration) });

  return result;
});
</script>

<style scoped>
.time-index-container {
  color: white;
  background: rgba(0, 0, 0, 0.4);
  font-size: 0.8rem;
  height: 16px;
  line-height: 16px;
  z-index: 1;
}

.time-index {
  text-align: center;
  z-index: 2;
  height: 100%;
}
</style>
