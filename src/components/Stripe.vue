<template>
  <!-- Disable draggable, otherwise browsers do that pseudo-dragging ghosting movement of images -->
  <div class="position-relative" ref="stripe" style="height: 100%;" @click="seek($event)" draggable="false">
    <img draggable="false"
         alt="stripe"
         @load="load"
         class="stripe position-absolute user-select-none"
         ref="stripeimage"
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
      <button @click="destroyMarking(i)" class="btn btn-danger btn-sm marking-destroy position-absolute">x</button>
    </div>
    <div v-if="showBar" class="timecode position-absolute" :style="{left: `${offset}px`}"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export interface Marking {
  selected?: boolean;
  start: number;
  end: number;
  timestart: number;
  timeend: number;
}

interface StripeData {
  startDown: boolean;
  endDown: boolean;
  clicked: boolean;
  moved: boolean;
  mouseOffsetX: number;
  width: number;
  left: number | null;
  markings: Marking[];
  startX: number;
  mouseDown: boolean;
  markerDownIndex: number;
  markerPos: string;
  markerX: number;
  inserted: boolean;
  showBar: boolean;
  clientX: number;
}

export default defineComponent({
  name: 'streamsink-stripe',
  data(): StripeData {
    return {
      startDown: false,
      endDown: false,
      clicked: false,
      moved: false,
      mouseOffsetX: 0,
      mouseDown: false,
      width: 0,
      left: null,
      markings: [],
      startX: 0,
      markerDownIndex: 0,
      markerPos: '',
      markerX: 0,
      inserted: false,
      showBar: true,
      clientX: 10,
    };
  },
  computed: {
    offset(): number {
      return this.timecode / this.duration * this.width;
    }
  },
  props: {
    src: { type: String, required: true },
    timecode: { type: Number, required: true },
    duration: { type: Number, required: true },
    paused: { type: Boolean, required: true },
  },
  watch: {
    timecode() {
      this.$emit('offset', { offset: this.offset, clientX: this.clientX });
    },
  },
  methods: {
    seek(event: MouseEvent) {
      //this.$emit('seek', this.getMouseX(event) / this.width * this.duration);
      this.clientX = this.getX(event);
      this.$emit('seek', this.getMouseX(event) / this.width * this.duration);
    },
    moveMarker(event: MouseEvent) {
      const x = this.getMouseX(event);
      const i = this.markerDownIndex;

      if (this.markerPos === 'start') {
        if (x > this.markings[i].end - 50) {
          return;
        }
        this.markings[i].start = x;
        this.markings[i].timestart = this.markings[i].start / this.width * this.duration;
        this.$emit('seek', this.markings[i].timestart);
      } else {
        if (x < this.markings[i].start + 50) {
          return;
        }
        this.markings[i].end = x;
        this.markings[i].timeend = this.markings[i].end / this.width * this.duration;
        this.$emit('seek', this.markings[i].timeend);
      }
    },
    markerUp() {
      if (!this.paused) {
        return;
      }

      this.markerDownIndex = 0;
      this.markerPos = '';
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', this.moveMarker);
      window.removeEventListener('mouseup', this.markerUp);
    },
    markerDown(event: MouseEvent, marker: Object, i: number, pos: string) {
      if (!this.paused) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (this.markerDownIndex !== 0) {
        return;
      }
      this.markerDownIndex = i;
      this.markerPos = pos;
      this.markerX = this.getMouseX(event);
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', this.moveMarker);
      window.addEventListener('mouseup', this.markerUp);
    },
    load() {
      this.width = (this.$refs.stripeimage as HTMLImageElement).clientWidth;
    },
    destroyMarking(index: number) {
      this.markings.splice(index, 1);
      this.$emit('update', this.markings);
    },
    getMouseX(event: MouseEvent): number {
      const stripe = this.$refs.stripe as HTMLImageElement;
      const bounds = stripe.getBoundingClientRect();
      return stripe.scrollLeft + event.clientX - bounds.left;
    },
    getX(event: MouseEvent) {
      const stripe = this.$refs.stripe as HTMLImageElement;
      const bounds = stripe.getBoundingClientRect();
      return event.clientX - bounds.left;
    },
    move(event: MouseEvent) {
      this.mouseOffsetX = this.getMouseX(event);
    },
    down(event: MouseEvent) {
      if (!this.paused) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      this.$emit('selecting', true);

      this.showBar = false;
      window.addEventListener('mousemove', this.move);
      this.left = this.getMouseX(event);
    },
    overlaps(xs: number[]) {
      for (let i = 0; i < this.markings.length; i++) {
        const start = this.markings[i].start;
        const end = this.markings[i].end;

        for (let j = 0; j < xs.length; j++) {
          if (xs[j] >= start && xs[j] <= end) {
            return true;
          }
        }
      }
      return false;
    },
    up(event: MouseEvent) {
      if (!this.paused) {
        return;
      }

      this.showBar = true;
      const startX = this.left as number;
      const endX = this.getMouseX(event);

      if (this.overlaps([startX, endX])) {
        return;
      }

      if ((this.getMouseX(event) - startX) > 10) {
        this.markings.push({
          selected: false,
          start: startX,
          end: endX,
          timestart: startX / this.width * this.duration,
          timeend: endX / this.width * this.duration
        });
        this.$emit('update', this.markings);
      }
      // Reset
      this.mouseOffsetX = 0;
      this.left = null;
    },
    markingSelect(index: number) {
      // catch event order from stripe before the delete button
      if (!this.markings[index]) {
        return;
      }

      // Only one at a time
      this.markings.forEach(m => m.selected = false);

      this.markings[index].selected = !this.markings[index].selected;
      this.$emit('seek', this.markings[index].timestart);
    },
    scroll(event: WheelEvent) {
      this.$emit('scroll', event);
    },
    resizePreview(event: WheelEvent) {
      const el = this.$refs.stripeimage as HTMLImageElement;

      const resizeBy = event.deltaY * 3;
      const oldWidth = el.width;

      el.width += resizeBy;

      if (el.width < window.innerWidth * 3 / 4) {
        el.width = oldWidth;
        return;
      }

      const factor = el.width / oldWidth;
      this.width = el.width;

      // Linear transformation on all x coordinates
      this.markings.forEach(m => {
        m.start *= factor;
        m.end *= factor;
      });
      //this.$emit('scroll', event);
    }
  },
  unmounted() {
    (this.$refs.stripe as HTMLDivElement)?.removeEventListener('wheel', this.resizePreview, true);
  },
  mounted() {
    (this.$refs.stripe as HTMLDivElement)?.addEventListener('wheel', this.resizePreview, true);
  }
});
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
