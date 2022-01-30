<template>
  <!-- Disable draggable, otherwise browsers do that pseudo-dragging ghosting movement of images -->
  <div class="position-relative" ref="stripe" style="height: 100%;" draggable="false">
    <img draggable="false"
         alt="stripe"
         @load="load"
         class="stripe position-absolute user-select-none"
         ref="stripeimage"
         :src="src"
         style="height: 100%"
         @mousemove="move($event)"
         @mousedown="down"
         @mouseup="up($event, $refs.stripe)"/>

    <div :key="marking.start" @click="markingSelect(i)"
         :class="{'selected': marking.selected, 'unselected': !marking.selected}" class="marking position-absolute"
         draggable="false" v-for="(marking, i) in markings"
         :style="{left: marking.start+'px', width: marking.end+'px'}">
      <span class="bar bar-start position-absolute"
            draggable="false"></span>
      <span class="bar bar-end position-absolute"
            draggable="false"></span>
      <button @click="destroyMarking(i)" class="btn btn-danger btn-sm marking-destroy position-absolute">x</button>
    </div>
    <div class="timecode position-absolute" :style="{left: `${offset}px`}"></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

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
}

export default defineComponent({
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
    };
  },
  computed: {
    offset(): number {
      return this.timecode / this.duration * this.width;
    }
  },
  props: {
    src: {type: String, required: true},
    timecode: {type: Number, required: true},
    duration: {type: Number, required: true},
  },
  watch: {
    timecode() {
      this.$emit("offset", this.offset);
    },
  },
  methods: {
    moveStart(i: number, event: MouseEvent) {
      event.preventDefault();
      this.startDown = true;
      this.endDown = false;
      this.startX = this.getMouseX(event);
    },
    moveEnd(i: number, event: MouseEvent) {
      event.preventDefault();
      this.startDown = false;
      this.endDown = true;
      this.startX = this.getMouseX(event);
    },
    startMove(i: number, event: MouseEvent) {
      event.preventDefault();
      if (this.startDown) {
        const x = this.getMouseX(event);
        const diff = Math.abs(x - this.markings[i].start);
        this.markings[i].start = x;
        this.markings[i].end -= diff;
        this.markings[i].timestart = x / this.width * this.duration;
      }
    },
    endMove(i: number, event: MouseEvent) {
      event.preventDefault();
      if (this.endDown) {
        const x = this.getMouseX(event);
        this.markings[i].end = x - this.startX;
        this.markings[i].timeend = x / this.width * this.duration;
      }
    },
    moveStartUp() {
      this.startDown = false;
      this.endDown = false;
    },
    moveEndUp() {
      this.startDown = false;
      this.endDown = false;
    },
    move(event: MouseEvent) {
      this.moved = this.mouseDown && Math.abs(event.clientX - this.mouseOffsetX) > 5;
    },
    load() {
      this.width = (this.$refs.stripeimage as HTMLImageElement).clientWidth;
    },
    destroyMarking(index: number) {
      this.markings.splice(index, 1);
      this.$emit("update", this.markings);
    },
    down(event: MouseEvent) {
      if (this.startDown || this.endDown) {
        return;
      }
      this.mouseDown = true;
      this.mouseOffsetX = event.clientX;
      this.left = this.getMouseX(event);
    },
    /**
     * Relative to parent the clicked x position.
     * @param event
     * @returns {number}
     */
    getMouseX(event: MouseEvent) {
      const stripe = this.$refs.stripe as HTMLImageElement;
      const bounds = stripe.getBoundingClientRect();
      return stripe.scrollLeft + event.clientX - bounds.left;
    },
    up(event: MouseEvent) {
      if (this.startDown || this.endDown) {
        return;
      }
      // Simple click
      if (this.mouseDown && !this.moved) {
        const img = this.$refs.stripeimage as HTMLImageElement;
        this.$emit("seek", this.getMouseX(event) / img.clientWidth * this.duration);
        this.reset();
        return;
      }
      this.selectEnd(event);
      this.reset();
    },
    reset() {
      this.mouseOffsetX = 0;
      this.mouseDown = false;
      this.left = null;
    },
    markingSelect(index: number) {
      // Only one at a time
      this.markings.forEach(m => m.selected = false);

      this.markings[index].selected = !this.markings[index].selected;
      this.$emit("seek", this.markings[index].timestart);
    },
    selectEnd(event: MouseEvent) {
      if (this.left) {
        this.markings.push({
          selected: false,
          start: this.left,
          end: Math.abs(this.getMouseX(event) - this.left),
          timestart: this.left / this.width * this.duration,
          timeend: this.getMouseX(event) / this.width * this.duration
        });
        this.$emit("update", this.markings);
        return;
      }
      alert("this.left is null");
    }
  },
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
  opacity: 0.8;
  cursor: e-resize;
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
