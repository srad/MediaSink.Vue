<template>
  <div class="modal show" tabindex="-1" ref="modalVideo" style="display: block !important;">
    <div class="modal-dialog modal-fullscreen p-0">
      <div class="modal-content">
        <div class="modal-body bg-light p-1" style="overflow: hidden">

          <div class="d-flex flex-row" style="height: 90%;">

            <div class="d-flex flex-column m-0" :class="{'w-80': markings.length > 0, 'w-100': markings.length===0}">
              <video class="view"
                     @click="paused=!paused"
                     @touchstart="paused=!paused"
                     ref="video"
                     @loadeddata="loaddata"
                     @timeupdate="timeupdate" muted autoplay controls>
                <source :src="fileUrl + '/' + pathRelative" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>

            <div v-if="markings.length > 0" class="d-flex flex-column m-0 px-1" :class="{'w-20': markings.length > 0}">
              <ul class="list-group fw-6 fw-bold">
                <li class="list-group-item d-flex text-white bg-info justify-content-between w-100 align-middle">
                  <span>Start</span>
                  <span>End</span>
                  <span>Del</span>
                </li>
                <li class="list-group-item d-flex justify-content-between w-100 align-middle" :class="{'bg-secondary': marking.selected}" @click="selectMarking(marking)" :key="String(marking.timestart)+String(marking.timeend)" v-for="marking in markings">
                  <span class="p-1">{{ (marking.timestart / 60).toFixed(1) }}min</span>
                  <span class="p-1">{{ (marking.timeend / 60).toFixed(1) }}min</span>
                  <button @click="destroyMarking(marking)" class="btn btn-sm btn-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                </li>
              </ul>
              <button class="btn btn-info mt-2">
                Play Cut
              </button>
            </div>

          </div>

          <div ref="stripeContainer" class="d-flex flex-row w-100 position-relative overflow-hidden" style="height: 10%;">
            <Stripe :src="fileUrl + '/' + previewStripe"
                    :paused="paused"
                    :timecode="timecode"
                    :duration="duration"
                    :markings="markings"
                    @selecting="paused=true"
                    @update="(m) => markings=m"
                    @seek="seek"
                    @scroll="scrollStripe"
                    @offset="offset"/>
          </div>
        </div>

        <div class="modal-footer p-0">
          <div class="d-flex input-group m-0" v-if="pathRelative">
            <div class="btn-group m-1">
              <button class="btn btn-danger" @click="$emit('destroy', {channelName: channelName, filename: filename})">
                Delete
              </button>
            </div>
            <div class="m-1 rounded-1 fw-6 px-1 py-3 border-info border">
              {{ (timecode / 60).toFixed(2) }}min
            </div>
            <input class="m-1 p-4 form-control form-range"
                   type="range"
                   v-model="timecode"
                   step="1"
                   @input="customSeek($event)"
                   min="0"
                   :max="duration">
            <!--
            <input type="range" class="m-1 p-4 form-control form-range" v-model="playbackSpeed" step="0.1"
                   min="0.1"
                   max="5.0"/>
                   -->
            <div class="btn-group m-1">
              <!--<button class="btn btn-dark" type="button" @click="playbackSpeed=1.0">Reset</button>-->

              <button v-if="!muted" class="btn btn-warning" type="button" @click="muted=true">
                Mute
              </button>
              <button v-else class="btn btn-info" type="button" @click="muted=false">
                Unmute
              </button>

              <button v-if="paused" class="btn btn-primary" type="button" @click="paused=false">Pause</button>
              <button v-else class="btn btn-success" type="button" @click="paused=true">
                Play
              </button>
              <button v-if="markings.length > 0" class="btn btn-warning" type="button" @click="exportVideo">
                Cut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
//import socket from "@/socket";
//import event from "@/services/event";
import { RecordingApi } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import { Marking } from '@/components/Stripe.vue';
import Stripe from '@/components/Stripe.vue';

interface VideoData {
  markings: any[];
  show: boolean;
  loaded: boolean;
  paused: boolean;
  timecode: number;
  duration: number;
  segments: any[],
  baseUrl?: string;
  muted: boolean;
  fileUrl?: string;
  playbackSpeed: number;
}

const recording = new RecordingApi();

export default defineComponent({
  components: { Stripe },
  inject: ['fileUrl'],
  props: {
    channelName: String,
    filename: String,
    pathRelative: String,
    previewStripe: String,

  },
  data(): VideoData {
    return {
      markings: [],
      show: true,
      loaded: false,
      paused: true,
      timecode: 0,
      duration: 0,
      segments: [],
      muted: true,
      playbackSpeed: 1.0,
    };
  },
  computed: {
    sortedSegments(): Marking[] {
      return this.segments.slice().sort((a: Marking, b: Marking) => a.start - b.start);
    },
  },
  watch: {
    muted(val) {
      (this.$refs.video as HTMLVideoElement).muted = val;
    },
    paused(val) {
      if (val) {
        (this.$refs.video as HTMLVideoElement).pause();
      } else {
        (this.$refs.video as HTMLVideoElement).play();
      }
    },
    playbackSpeed(newVal) {
      (this.$refs.video as HTMLVideoElement).playbackRate = newVal;
    },
  },
  methods: {
    resetSelection() {
      for (let i = 0; i < this.markings.length; i++) {
        this.markings[i].selected = false;
      }
    },
    selectMarking(marking: Marking) {
      this.resetSelection();
      (this.$refs.video as HTMLVideoElement).currentTime = marking.timestart;
      marking.selected = true;
    },
    destroyMarking(marking: Marking) {
      for (let i = 0; i < this.markings.length; i++) {
        if (this.markings[i].timestart === marking.timestart && this.markings[i].timeend === marking.timeend) {
          this.markings.splice(i, 1);
          break;
        }
      }
    },
    customSeek(event: InputEvent) {
      this.paused = !this.paused;
      //@ts-ignore
      (this.$refs.video as HTMLVideoElement).currentTime = event.target.value;
      this.paused = !this.paused;
    },
    scrollStripe(event: WheelEvent) {
      (this.$refs.video as HTMLVideoElement).currentTime += event.deltaY / 10;
      return (this.$refs.stripeContainer as HTMLDivElement).scrollLeft += event.deltaY;
    },
    play() {
      this.paused = false;
    },
    pause() {
      this.paused = true;
    },
    rotate() {
      const mql = window.matchMedia('(orientation: portrait)');

      if (mql.matches) {
        (this.$refs.video as HTMLVideoElement).requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    endSegment(end: number) {
      (this.$refs.video as HTMLVideoElement).currentTime = end;
    },
    exportVideo() {
      if (window.confirm('Export selected segments?')) {
        const starts = this.markings.map(m => String(m.timestart.toFixed(4)));
        const ends = this.markings.map(m => String(m.timeend.toFixed(4)));

        recording.cut(
            this.$route.params.channelName as string,
            this.$route.params.filename as string,
            { starts, ends })
            .then(() => {
              this.markings = [];
            })
            .catch(err => alert(err));
      }
    },
    isPaused() {
      return (this.$refs.video as HTMLVideoElement).paused;
    },
    seek(timecode: number) {
      this.paused = true;
      (this.$refs.video as HTMLVideoElement).currentTime = timecode;
    },
    offset({ offset, clientX }: { offset: number, clientX: number }) {
      requestAnimationFrame(() => {
        //(this.$refs.stripeContainer as HTMLDivElement).scrollLeft = left - window.innerWidth / 2;
        (this.$refs.stripeContainer as HTMLDivElement).scrollLeft = offset - clientX;
      });
    },
    loaddata() {
      this.duration = (this.$refs.video as HTMLVideoElement).duration;
      this.loaded = true;
    },
    timeupdate() {
      this.timecode = (this.$refs.video as HTMLVideoElement).currentTime;
    },
  },
  beforeRouteLeave() {
    const video = this.$refs.video as HTMLVideoElement;
    video.pause();
    video.removeAttribute('src');
    video.load();
    this.show = false;
  },
  unmounted() {
    window.removeEventListener('orientationchange', this.rotate);
  },
  mounted() {
    //this.modal = new window.bootstrap.Modal(this.$refs.modalVideo);
    window.addEventListener('orientationchange', this.rotate);
    //this.modal.show();
    this.show = true;
  },
});
</script>

<style scoped>
</style>
