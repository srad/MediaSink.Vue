<template>
  <div ref="stripeContainer" @mousedown.stop="startSelection" class="position-relative h-100 whitespace-nowrap overflow-x-scroll user-select-none" draggable="false" style="min-height: 100px">
    <div class="position-absolute bottom-0">
      <VideoTimeIndex v-if="imageLoaded && props.loaded" :duration="props.duration" :width="stripeImage!.width" />
    </div>

    <img draggable="false" alt="stripe" class="stripe position-absolute" ref="stripeImage" :src="src" style="height: 100%" />

    <div :key="selection.start" @click="select(i)" class="marking position-absolute" v-for="(selection, i) in drawSelections" :style="{ transform: `translateX(${selection.start}px)`, width: selection.end - selection.start + 'px' }">
      <div class="selection w-100 h-100" style="pointer-events: none" :class="{ selected: selection.selected }"></div>
      <div v-if="currentSelection !== null && hasMinSelection || !currentSelection" class="handle handle-left position-absolute" @mousedown.stop="startResize(selection, 'left')"></div>
      <div v-if="currentSelection !== null && hasMinSelection || !currentSelection" class="handle handle-right position-absolute" @mousedown.stop="startResize(selection, 'right')"></div>
      <div v-if="(currentSelection === selection && hasMinSelection) || currentSelection !== selection" class="selection-duration">{{ formatDuration(selection) }}</div>
      <button type="button" v-if="currentSelection !== selection" @click.stop="destroy(i)" class="text-white btn btn-danger p-1 bi bi-x op-100 marking-destroy position-absolute"></button>
    </div>

    <div v-if="showBar" class="timecode position-absolute" :style="{ transform: `translateX(${barLeft}px)` }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { BigNumber } from "bignumber.js";
import { animateScrollLeft } from "../utils/animations";
import VideoTimeIndex from "./VideoTimeIndex.vue";

export type Selection = {
  selected?: boolean;
  start: number;
  end: number;
  timestart: number;
  timeend: number;
};

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
  (e: "marking", value: Selection[]): void;
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const selections = ref<Selection[]>([]);
const isSelecting = ref<boolean>(false);
const currentSelection = ref<Selection | null>(null);
const isResizing = ref<boolean>(false);
const resizeDirection = ref<"left" | "right" | null>(null);
const showBar = ref(true);
const stripeImage = ref<HTMLImageElement>();
const stripeContainer = ref<HTMLElement>();
const width = ref(0);
const barLeft = ref(0);
const imageLoaded = ref(false);

let seekedThroughStripeClick = false;

const minDuration = 1;

// --------------------------------------------------------------------------------------
// Computed
// --------------------------------------------------------------------------------------

const dT = computed<number>(() => {
  if (currentSelection.value) {
    return currentSelection.value.timeend - currentSelection.value.timestart;
  }
  return 0;
});

const hasMinSelection = computed<boolean>(() => dT.value > minDuration);

const drawSelections = computed(() => (currentSelection.value ? selections.value.concat(currentSelection.value) : selections.value));

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

// The user clicked on the seek-bar in the video element.
watch(
  () => props.seeked,
  (timeIndex: number) => {
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

    const scrollLeft = barLeft.value - stripeContainer.value.getBoundingClientRect().width / 2;
    animateScrollLeft(stripeContainer.value, scrollLeft, 1000);
  },
);

watch(
  () => props.timecode,
  (timecode) => {
    requestAnimationFrame(() => {
      const timeOffset = timecode / props.duration;
      barLeft.value = new BigNumber(timeOffset).multipliedBy(stripeImage.value!.width).toNumber();
    });
  },
);

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(() => {
  stripeContainer.value?.addEventListener("wheel", resizePreview, true);
  if (stripeImage.value) {
    stripeImage.value.onload = load;
  }
  window.addEventListener("mousemove", updateResize);
  window.addEventListener("mouseup", endResize);
  window.addEventListener("mousemove", updateSelection);
  window.addEventListener("mouseup", endSelection);
});

onUnmounted(() => {
  stripeContainer.value?.removeEventListener("wheel", resizePreview, true);
  window.removeEventListener("mousemove", updateResize);
  window.removeEventListener("mouseup", endResize);
  window.removeEventListener("mouseup", updateSelection);
  window.removeEventListener("mouseup", endSelection);
});

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

const startResize = (selection: Selection, direction: "left" | "right") => {
  isResizing.value = true;
  resizeDirection.value = direction;
  currentSelection.value = selection;
};

// End resize when mouse is released
const endResize = () => {
  if (isSelecting.value) {
    return;
  }
  isResizing.value = false;
  resizeDirection.value = null;
  currentSelection.value = null;
};

const updateResize = (event: MouseEvent) => {
  if (!isResizing.value || !currentSelection.value) {
    return;
  }

  const x = getMouseX(event);

  if (resizeDirection.value === "left") {
    currentSelection.value.start = Math.min(x, currentSelection.value.end);
    currentSelection.value.timestart = convertToTime(x);
  } else if (resizeDirection.value === "right") {
    currentSelection.value.end = Math.max(x, currentSelection.value.start);
    currentSelection.value.timeend = convertToTime(x);
  }
};

const formatDuration = (selection: Selection) => {
  const duration = selection.timeend - selection.timestart;
  const minutes = Math.floor(duration / 60);
  const seconds = (duration % 60).toFixed(1);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const load = () => {
  width.value = stripeImage.value!.clientWidth;
  imageLoaded.value = true;
};

const destroy = (index: number): void => {
  if (props.disabled) {
    return;
  }
  selections.value.splice(index, 1);
  emit("marking", selections.value);
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

const startSelection = (event: MouseEvent): void => {
  if (isResizing.value) {
    return;
  }

  isSelecting.value = true;
  const posX = getMouseX(event);
  const selection = {
    selected: false,
    start: posX,
    end: posX,
    timestart: (posX / width.value) * props.duration,
    timeend: (posX / width.value) * props.duration,
  };
  currentSelection.value = selection;
};

const convertToTime = (posX: number): number => (posX / width.value) * props.duration;

const updateSelection = (event: MouseEvent) => {
  if (!isSelecting.value || !currentSelection.value) {
    return;
  }

  const endX = stripeContainer.value!.scrollLeft + getX(event);

  // Update selection bounds.
  currentSelection.value.end = Math.max(endX, currentSelection.value.start);
  currentSelection.value.end = Math.min(stripeImage.value!.width, currentSelection.value.end); // Guard

  // Update time index.
  currentSelection.value.timestart = convertToTime(currentSelection.value.start);
  currentSelection.value.timeend = convertToTime(currentSelection.value.end);
};

const endSelection = (event: MouseEvent): void => {
  if (!isSelecting.value || !currentSelection.value) {
    return;
  }

  if (currentSelection.value && dT.value < minDuration) {
    seek(event);
  } else {
    selections.value.push(currentSelection.value);
    emit("marking", selections.value);
  }
  isSelecting.value = false;
  currentSelection.value = null;
  emit("marking", selections.value);
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
  if (!isSelecting.value) {
    return false;
  }

  const sorted = selections.value.sort((a, b) => a.start - b.start).sort((a, b) => a.end - b.end);

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

const select = (index: number): void => {
  // catch event order from stripe before the delete button
  if (props.disabled || !selections.value[index]) {
    return;
  }

  selections.value.map((x) => (x.selected = false));
  selections.value[index].selected = true;
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
  selections.value.forEach((m) => {
    m.start *= factor;
    m.end *= factor;
  });
  //emit('scroll', event);
};
</script>

<style scoped>
.marking {
  height: 100%;
}

.selection {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(0, 123, 255, 0.35);
  /*border: 1px solid #007bff;*/
  cursor: pointer;
}

.handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  opacity: 0.9;
  background: #007bff;
  cursor: ew-resize;
  user-select: none;
}

.selected {
  background: blueviolet;
  opacity: 0.4;
}

.selection-duration {
  user-select: none;
  position: absolute;
  top: 5px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 5px;
  font-size: 12px;
  border-radius: 3px;
}

.marking-destroy {
  right: 8px;
  top: 4px;
  line-height: 18px;
  margin: 0;
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

.handle-left {
  left: 0;
}

.handle-right {
  right: 0;
}
</style>
