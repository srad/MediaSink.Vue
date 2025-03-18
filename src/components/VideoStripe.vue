<template>
  <div ref="stripeContainer" class="position-relative h-100 whitespace-nowrap overflow-x-scroll" @click="seek($event)" draggable="false" style="min-height: 100px">
    <div class="position-absolute bottom-0">
      <VideoTimeIndex v-if="imageLoaded && props.loaded" :duration="props.duration" :width="stripeImage!.width"/>
    </div>

    <img draggable="false" alt="stripe" class="stripe position-absolute" ref="stripeImage" :src="src" style="height: 100%;" @mousedown="down($event)"/>

    <div :key="marking.start" @click="markingSelect(i)" :class="{ selected: marking.selected, unselected: !marking.selected }" class="marking position-absolute" draggable="false" v-for="(marking, i) in markings" :style="{ transform: `translateX(${marking.start}px)`, width: marking.end - marking.start + 'px' }">
      <span class="bar bar-start position-absolute" draggable="false" v-if="currentMarkerIndex === -1 || (currentMarkerIndex - 1 === i && !mouseDown)" @mousedown="markerDown($event, marking, i, 'start')"> </span>
      <span class="bar bar-end position-absolute" v-if="currentMarkerIndex === -1 || (currentMarkerIndex - 1 === i && !mouseDown)" @mousedown="markerDown($event, marking, i, 'end')" draggable="false"></span>
      <i @click="destroyMarking(i)" v-if="currentMarkerIndex === -1 || (currentMarkerIndex - 1 === i && !mouseDown)" class="text-white bg-danger p-1 bi bi-trash op-100 marking-destroy position-absolute" style="opacity: 1"></i>
    </div>

    <span v-if="showBar" class="timecode position-absolute" :style="{ transform: `translateX(${barLeft}px)` }"></span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { Marking } from "../types/appTypes";
import { BigNumber } from "bignumber.js";
import { animateScrollLeft } from "../utils/animations";
import VideoTimeIndex from "./VideoTimeIndex.vue";

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  loaded: boolean;
  src: string;
  timecode: number;
  duration: number;
  paused: boolean;
  disabled?: boolean;
  seeked: number;
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: "seek", timeIndex: number): void;
  (e: "selecting"): void;
  (e: "marking", value: Marking[]): void;
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const markings = ref<Marking[]>([]);
const showBar = ref(true);
const stripeImage = ref<HTMLImageElement>();
const stripeContainer = ref<HTMLElement>();

let markerPos = "";
let markerDownIndex = 0;
let mouseOffsetX = 0;
let mouseDown = false;
let mouseMoved = false;
let currentMarkerIndex = -1;
const width = ref(0);
const barLeft = ref(0);
const imageLoaded = ref(false);

let seekedThroughStripeClick = false;

// --------------------------------------------------------------------------------------
// Computed
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

// The user clicked on the seek-bar in the video element.
watch(() => props.seeked, (timeIndex: number) => {
  if (props.disabled || !stripeImage.value || !stripeContainer.value) {
    return;
  }

  // The problem is that seeked is also triggered
  if (seekedThroughStripeClick) {
    seekedThroughStripeClick = false;
    return;
  }

  const timeOffset = timeIndex / props.duration;
  barLeft.value = new BigNumber(timeOffset).multipliedBy(stripeImage.value.width).toNumber();

  const scrollLeft = barLeft.value - (stripeContainer.value.getBoundingClientRect().width / 2);
  animateScrollLeft(stripeContainer.value, scrollLeft, 1000);
});

watch(() => props.timecode, (timecode) => {
  requestAnimationFrame(() => {
    const timeOffset = timecode / props.duration;
    barLeft.value = new BigNumber(timeOffset).multipliedBy(stripeImage.value!.width).toNumber();
  });
});

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(() => {
  stripeContainer.value?.addEventListener("wheel", resizePreview, true);
  if (stripeImage.value) {
    stripeImage.value.onload = load;
  }
});

onUnmounted(() => stripeContainer.value?.removeEventListener("wheel", resizePreview, true));

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const getCurrentTimeIndex = (): BigNumber => {
  const offset = new BigNumber(barLeft.value).dividedBy(stripeImage.value!.width);
  const timeOffset = offset.multipliedBy(props.duration);

  return timeOffset;
};

const emitCurrentTimeIndex = (): void => {
  emit("seek", getCurrentTimeIndex().toNumber());
};

const seek = (event: MouseEvent): void => {
  if (props.disabled || !stripeImage.value || !stripeContainer.value) {
    return;
  }
  seekedThroughStripeClick = true; // Prevents twice handling seek event.

  barLeft.value = stripeContainer.value.scrollLeft + getX(event);
  showBar.value = true;

  emitCurrentTimeIndex();
};

const moveMarker = (event: MouseEvent): void => {
  const i = markerDownIndex;
  if (!markings.value[i]) {
    return;
  }

  const x = getMouseX(event);

  if (markerPos === "start") {
    if (x > markings.value[i].end - 50) {
      return;
    }
    markings.value[i].start = x;
    markings.value[i].timestart = (markings.value[i].start / width.value) * props.duration;
  } else {
    if (x < markings.value[i].start + 50) {
      return;
    }
    markings.value[i].end = x;
    markings.value[i].timeend = (markings.value[i].end / width.value) * props.duration;
  }
};

const markerUp = (): void => {
  if (!props.paused) {
    return;
  }

  markerDownIndex = 0;
  markerPos = "";
  document.body.style.cursor = "default";
  window.removeEventListener("mousemove", moveMarker);
  window.removeEventListener("mouseup", markerUp);
  emit("marking", markings.value);
  emitCurrentTimeIndex();
};

const markerDown = (event: MouseEvent, marker: object, i: number, pos: string): void => {
  event.preventDefault();
  event.stopPropagation();

  if (props.disabled || !props.paused) {
    return;
  }

  if (markerDownIndex !== 0) {
    return;
  }
  markerDownIndex = i;
  markerPos = pos;
  document.body.style.cursor = "col-resize";
  window.addEventListener("mousemove", moveMarker);
  window.addEventListener("mouseup", markerUp);
};

const load = () => {
  width.value = stripeImage.value!.clientWidth;
  imageLoaded.value = true;
};

const destroyMarking = (index: number): void => {
  if (props.disabled) {
    return;
  }
  markings.value.splice(index, 1);
  emit("marking", markings.value);
};

const getMouseX = (event: MouseEvent): number => {
  if (!stripeContainer.value) {
    return 0;
  }
  return event.clientX - stripeContainer.value.getBoundingClientRect().left + stripeContainer.value.scrollLeft;
};

const getX = (event: MouseEvent): number => {
  const bounds = stripeContainer.value!.getBoundingClientRect();
  return event.clientX - bounds.left;
};

const down = (event: MouseEvent): void => {
  event.stopPropagation();
  event.preventDefault();

  showBar.value = false;
  mouseDown = true;

  const posX = getMouseX(event);

  currentMarkerIndex = markings.value.push({
    selected: false,
    start: posX,
    end: posX,
    timestart: (posX / width.value) * props.duration,
    timeend: (posX / width.value) * props.duration,
  });

  window.addEventListener("mousemove", mouseMove);
  window.addEventListener("mouseup", mouseUp);
};

const mouseMove = (event: MouseEvent): void => {
  event.stopPropagation();
  event.preventDefault();

  mouseMoved = true;
  if (currentMarkerIndex !== -1) {
    emit("selecting");
    mouseOffsetX = getMouseX(event);
    markings.value[currentMarkerIndex - 1]!.end = mouseOffsetX;
    markings.value[currentMarkerIndex - 1]!.timeend = (mouseOffsetX / width.value) * props.duration;
  }
};

const mouseUp = (event: MouseEvent): void => {
  event.stopPropagation();
  event.preventDefault();

  if (!mouseDown) {
    return;
  }

  mouseDown = false;

  if (!mouseMoved && currentMarkerIndex !== -1) {
    markings.value.splice(currentMarkerIndex - 1, 1);
    mouseMoved = false;
    showBar.value = true;
    currentMarkerIndex = -1;
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
    return;
  }
  mouseMoved = false;

  if (!props.paused) {
    return;
  }

  const marking = markings.value[currentMarkerIndex - 1];
  const durationInSeconds = marking!.timeend - marking!.timestart;

  if (durationInSeconds < 1) {
    destroyMarking(currentMarkerIndex - 1);
  }

  currentMarkerIndex = -1;
  window.removeEventListener("mousemove", mouseMove);
  window.removeEventListener("mouseup", mouseUp);

  // Reset
  showBar.value = true;
  mouseOffsetX = 0;
  mouseMoved = false;
  emit("marking", markings.value);
};

/**
 * Checks if a selection has an overlap.
 * Right now overlaps are allowed for creative purposes, this allows to make join repeated recordings segments.
 * However, in case overlaps shall be forbidden, this function can check the marking for overlaps.
 * @param selectionStart
 * @param selectionEnd
 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const overlaps = (selectionStart: number, selectionEnd: number) => {
    // No markings yet.
    if (markings.value.length === 0 || currentMarkerIndex === markings.value.length) {
      return false;
    }

    const sorted = markings.value.sort((a, b) => a.start - b.start).sort((a, b) => a.end - b.end);

    // Smaller than first marking.
    if (selectionStart < sorted[0]!.start && selectionEnd < sorted[0]!.end) {
      return false;
    }

    // Traverse all markings and make sure there is no overlap.
    for (let i = 0; i < sorted.length; i++) {
      const start = sorted[i]!.start;
      const end = sorted[i]!.end;

      // Multiple cases:
      // |----******----| -> start >= selectionStart && selectionEnd <= end
      // ****|****------| -> selectionStart <= start && end >= selectionStart && end <= selectionEnd
      //|-------***|****  -> selectionStart >= start && selectionStart <= end && selectionEnd >= end
      //****|*****|*****  -> selectionStart => start && selectionEnd <= end

      const overlaps = (start >= selectionStart && selectionEnd <= end) || (selectionStart <= start && end >= selectionStart && end <= selectionEnd) || (start && selectionStart <= end && selectionEnd >= end) || (selectionStart <= start && selectionEnd >= end);

      if (overlaps) {
        return true;
      }
    }
    return false;
  };

const markingSelect = (index: number): void => {
  // catch event order from stripe before the delete button
  if (props.disabled || !markings.value[index]) {
    return;
  }

  // Only one at a time
  markings.value.forEach((m) => (m.selected = false));
  markings.value[index]!.selected = !markings.value[index]!.selected;
};

const resizePreview = (event: WheelEvent): void => {
  const imgElement = stripeImage.value!;

  const resizeBy = event.deltaY * 3;
  const oldWidth = imgElement.width;

  imgElement.width += resizeBy;

  if (imgElement.width < (window.innerWidth * 3) / 4) {
    imgElement.width = oldWidth;
    return;
  }

  const factor = imgElement.width / oldWidth;
  width.value = imgElement.width;

  // Linear transformation on all x coordinates
  barLeft.value *= factor;
  stripeContainer.value!.scrollLeft *= factor; // Prevents that
  markings.value.forEach((m) => {
    m.start *= factor;
    m.end *= factor;
  });
  //emit('scroll', event);
};
</script>

<style scoped>
.marking {
  height: 100%;
  opacity: 0.5;
}

.unselected {
  background: #42b983;
  user-select: none;
}

.selected {
  background: greenyellow;
  user-select: none;
}

.marking-destroy {
  right: 8px;
  top: 4px;
  line-height: 18px;
  border-radius: 4px;
  margin: 0;
  user-select: none;
}

.bar {
  height: 100%;
  width: 3px;
  background: magenta;
  opacity: 1;
  cursor: ew-resize;
  user-select: none;
}

.timecode {
  width: 3px;
  height: 100%;
  background: greenyellow;
  user-select: none;
}

img {
  user-select: none;
  image-rendering: optimizeQuality;
}

.bar-start {
  left: 0;
}

.bar-end {
  right: 0;
}
</style>
