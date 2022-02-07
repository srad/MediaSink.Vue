<template>
  <div class="modal show" tabindex="-1" ref="modalVideo" style="display: block !important;">
    <div class="modal-dialog modal-fullscreen p-0">
      <div class="modal-content">
        <div class="modal-body bg-light p-0" style="overflow: hidden">
          <div class="d-flex flex-row w-100" style="height: 90%;">
            <div class="d-flex flex-column m-0 w-100">
              <video class="view"
                     @click="paused=!paused"
                     ref="video"
                     @loadeddata="loaddata"
                     @timeupdate="timeupdate" muted autoplay controls>
                <source :src="fileUrl + '/' + pathRelative" type="video/mp4">
                Your browser does not support the video tag.
              </video>
              <input v-if="false"
                     class="w-100 p-0 m-0"
                     type="range"
                     min="0"
                     v-model="timecode"
                     :max="duration">
            </div>
          </div>

          <div ref="stripeContainer" class="d-flex flex-row w-100 position-relative" style="height: 10%; overflow-x: auto">
            <Stripe :src="fileUrl + '/' + previewStripe"
                    :timecode="timecode"
                    :duration="duration"
                    :markings="markings"
                    @update="(m) => markings=m"
                    @seek="seek"
                    @scroll="scrollStripe"
                    @offset="offset"/>
          </div>
        </div>

        <div class="modal-footer p-0">
          <div class="input-group m-0" v-if="pathRelative">
            <div class="btn-group m-1">
              <button class="btn btn-danger" @click="$emit('destroy', {channelName: channelName, filename: filename})">
                Delete
              </button>
            </div>
            <input type="range" class="m-1 p-4 form-control form-range" v-model="playbackSpeed" step="0.1"
                   min="0.1"
                   max="5.0"/>
            <div class="btn-group m-1">
              <button v-if="paused" class="btn btn-success" type="button" @click="paused=false">
                Play
              </button>
              <button v-else class="btn btn-primary" type="button" @click="paused=true">Pause</button>
              <button class="btn btn-dark" type="button" @click="playbackSpeed=1.0">Reset</button>
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
      playbackSpeed: 1.0,
    };
  },
  computed: {
    sortedSegments(): Marking[] {
      return this.segments.slice().sort((a: Marking, b: Marking) => a.start - b.start);
    },
  },
  watch: {
    paused(val) {
      if (val) {
        (this.$refs.video as HTMLVideoElement).play();
      } else {
        (this.$refs.video as HTMLVideoElement).pause();
      }
    },
    playbackSpeed(newVal) {
      (this.$refs.video as HTMLVideoElement).playbackRate = newVal;
    },
  },
  methods: {
    scrollStripe(event: WheelEvent) {
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
      // Timecode by clicking on image
      // const bounds = stripe.getBoundingClientRect();
      // const x = stripe.scrollLeft + event.clientX - bounds.left;
      // const sections = img.clientWidth / 64;
      // const selection = Math.floor(x / sections);
      // this.$refs.video.currentTime = this.$refs.video.duration / 64 * selection;
    },
    offset(pixel: number) {
      if (!this.isPaused()) {
        requestAnimationFrame(() => {
          (this.$refs.stripeContainer as HTMLDivElement).scrollLeft = pixel - window.innerWidth / 2;
        });
      }
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
