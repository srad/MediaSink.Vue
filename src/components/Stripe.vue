<template>
  <!-- Disable draggable, otherwise browsers do that pseudo-dragging ghosting movement of images -->
  <div class="position-relative user-select-none" ref="stripe" style="height: 100%;" @click="seek($event)" draggable="false">
    <img draggable="false"
         alt="stripe"
         @load="load"
         class="stripe position-absolute"
         ref="stripeImage"
         :src="src"
         style="height: 100%"
         @mousedown="down"
         @mouseup="up($event)"/>

    <div :key="marking.start"
         @click="markingSelect(i)"
         :class="{'selected': marking.selected, 'unselected': !marking.selected}"
         class="marking position-absolute"
         draggable="false"
         v-for="(marking, i) in markings"
         :style="{left: marking.start+'px', width: (marking.end-marking.start)+'px'}">
      <span class="bar bar-start position-absolute"
            draggable="false"
            @mousedown="markerDown($event, marking, i, 'start')">
      </span>
      <span class="bar bar-end position-absolute" @mousedown="markerDown($event, marking, i, 'end')" draggable="false"></span>
      <i @click="destroyMarking(i)" class="text-white bg-danger p-1 bi bi-x marking-destroy position-absolute" style="opacity: 1"></i>
    </div>

    <div v-if="showBar" class="timecode position-absolute" :style="{left: `${offset}px`}"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, onMounted, onUnmounted, defineEmits } from 'vue';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  src: string
  timecode: number
  duration: number
  paused: boolean
  disabled: boolean
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'width', value: number): void
  (e: 'offset', offset: number, clientX: number): void
  (e: 'seek', value: { clientX: number, width: number }): void
  (e: 'selecting', value: boolean): void
  (e: 'marking', value: Marking[]): void
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

export interface Marking {
  selected?: boolean;
  start: number;
  end: number;
  timestart: number;
  timeend: number;
}

const startDown = ref(false);
const endDown = ref(false);
const clicked = ref(false);
const moved = ref(false);
const mouseOffsetX = ref(0);
const mouseDown = ref(false);
const width = ref(0);
const left = ref<number>(0);
const markings = ref<Marking[]>([]);
const startX = ref(0);
const markerDownIndex = ref(0);
const markerPos = ref('');
const markerX = ref(0);
const inserted = ref(false);
const showBar = ref(true);
const clientX = ref(0);
const isMounted = ref(false);

const stripeImage = ref<HTMLImageElement | null>(null);
const stripe = ref<HTMLDivElement | null>(null);

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onUnmounted(() => stripe.value?.removeEventListener('wheel', resizePreview, true));

onMounted(() => {
  stripe.value?.addEventListener('wheel', resizePreview, true);
  isMounted.value = true;
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const offset = computed(() => {
  const offset = (props.timecode / props.duration) * width.value;
  emit('offset', offset, clientX.value);
  return offset;
});

const seek = (event: MouseEvent) => {
  if (props.disabled) {
    return;
  }

  //emit('seek', this.getMouseX(event) / this.width * this.duration);
  clientX.value = getX(event);
  emit('seek', { clientX: getMouseX(event), width: width.value });
};

const moveMarker = (event: MouseEvent) => {
  const x = getMouseX(event);
  const i = markerDownIndex.value;

  if (markerPos.value === 'start') {
    if (x > markings.value[i].end - 50) {
      return;
    }
    markings.value[i].start = x;
    markings.value[i].timestart = markings.value[i].start / width.value * props.duration;
    // TODO: emit('seek', markings.value[i].timestart);
  } else {
    if (x < markings.value[i].start + 50) {
      return;
    }
    markings.value[i].end = x;
    markings.value[i].timeend = markings.value[i].end / width.value * props.duration;
    // TODO: emit('seek', markings.value[i].timeend);
  }
};

const markerUp = () => {
  if (!props.paused) {
    return;
  }

  markerDownIndex.value = 0;
  markerPos.value = '';
  document.body.style.cursor = 'default';
  window.removeEventListener('mousemove', moveMarker);
  window.removeEventListener('mouseup', markerUp);
};

const markerDown = (event: MouseEvent, marker: Object, i: number, pos: string) => {
  if (props.disabled || !props.paused) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  if (markerDownIndex.value !== 0) {
    return;
  }
  markerDownIndex.value = i;
  markerPos.value = pos;
  markerX.value = getMouseX(event);
  document.body.style.cursor = 'col-resize';
  window.addEventListener('mousemove', moveMarker);
  window.addEventListener('mouseup', markerUp);
};

const load = () => {
  width.value = stripeImage.value!.clientWidth;
  emit('width', width.value);
};

const destroyMarking = (index: number) => {
  if (props.disabled) {
    return;
  }
  markings.value.splice(index, 1);
  emit('marking', markings.value);
};

const getMouseX = (event: MouseEvent): number => {
  const el = stripe;
  const bounds = el.value!.getBoundingClientRect();
  return el.value!.scrollLeft + event.clientX - bounds.left;
};

const getX = (event: MouseEvent) => {
  const bounds = stripe.value!.getBoundingClientRect();
  return event.clientX - bounds.left;
};

const move = (event: MouseEvent) => mouseOffsetX.value = getMouseX(event);

const down = (event: MouseEvent) => {
  if (!props.paused) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();

  emit('selecting', true);

  showBar.value = false;
  window.addEventListener('mousemove', move);
  left.value = getMouseX(event);
};

const overlaps = (selectionStart: number, selectionEnd: number) => {
  for (let i = 0; i < markings.value.length; i++) {
    const start = markings.value[i].start;
    const end = markings.value[i].end;

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

const up = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();

  if (!props.paused) {
    return;
  }

  showBar.value = true;
  const startX = left.value;
  const endX = getMouseX(event);

  if (overlaps(startX, endX)) {
    return;
  }

  if ((getMouseX(event) - startX) > 10) {
    markings.value.push({
      selected: false,
      start: startX,
      end: endX,
      timestart: startX / width.value * props.duration,
      timeend: endX / width.value * props.duration
    });
    emit('marking', markings.value);
  }
  // Reset
  mouseOffsetX.value = 0;
  left.value = 0; // Original left nullable and left.value = null;
};

const markingSelect = (index: number) => {
  // catch event order from stripe before the delete button
  if (props.disabled || !markings.value[index]) {
    return;
  }

  // Only one at a time
  markings.value.forEach(m => m.selected = false);

  markings.value[index].selected = !markings.value[index].selected;
  // TODO: emit('seek', markings.value[index].timestart);
};

const resizePreview = (event: WheelEvent) => {
  const el = stripeImage.value!;

  const resizeBy = event.deltaY * 3;
  const oldWidth = el.width;

  el.width += resizeBy;

  if (el.width < window.innerWidth * 3 / 4) {
    el.width = oldWidth;
    return;
  }

  const factor = el.width / oldWidth;
  width.value = el.width;

  // Linear transformation on all x coordinates
  markings.value.forEach(m => {
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
  background: blueviolet;
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
  background: white;
  opacity: 1;
  cursor: ew-resize;
  user-select: none;
}

.timecode {
  width: 3px;
  height: 100%;
  background: red;
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
  right: 0
}
</style>
