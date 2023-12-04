<template>
  <div class="modal show m-0 p-0m position-absolute" tabindex="-1" ref="modalVideo" style="display: block !important;">
    <div class="modal-dialog modal-fullscreen p-0">
      <div class="modal-content">
        <div class="modal-body bg-light p-1" style="overflow: hidden">

          <div class="d-flex flex-row" style="height: 90%;">

            <div class="d-flex flex-column m-0" :class="{'w-80': markings.length > 0, 'w-100': markings.length===0}">
              <video class="view h-100" controls
                     @click="paused=!paused"
                     @touchstart="paused=!paused"
                     ref="video"
                     @loadeddata="loaddata"
                     @timeupdate="timeupdate" muted autoplay>
                <source :src="videoUrl" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>

            <div v-if="markings.length > 0" class="d-flex flex-column m-0 px-1" :class="{'w-20': markings.length > 0}">
              <ul class="list-group fw-6 fw-bold">
                <li class="list-group-item d-flex text-white bg-info justify-content-between w-100 align-middle">
                  <span>{{ $t('videoView.segment.start') }}</span>
                  <span>{{ $t('videoView.segment.end') }}</span>
                  <span>{{ $t('videoView.segment.destroy') }}</span>
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
                Play Cut <i class="bi bi-scissors"></i>
              </button>
            </div>

          </div>

          <div ref="stripeContainer" class="d-flex flex-row w-100 position-relative overflow-y-scroll" style="height: 10%;">
            <Stripe :src="stripePath"
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

        <div class="modal-footer p-1" v-if="previewPath">
          <div class="d-flex w-100">
            <input class="form-control form-range flex-fill me-2"
                   type="range"
                   v-model="timecode"
                   step="1"
                   @input="customSeek($event)"
                   min="0"
                   :max="duration">
            <!--
            <input type="range" class="m-1 p-4 form-control form-range" v-model="playbackSpeed" step="0.1"
                   min="0.1"
                   max="5.0"/>-->

            <div class="d-flex justify-content-evenly flex-fill" style="width: 30%">
              <div class="fw-6 me-2">
                {{ (timecode / 60).toFixed(2) }}/{{ durationMin }} min
              </div>

              <button class="btn bg-primary text-white btn-sm me-2" @click="() => this.$refs.video.currentTime -= 30">
                <i class="bi bi-chevron-left"/>
              </button>

              <button class="btn bg-primary text-white btn-sm me-2" @click="() => this.$refs.video.currentTime += 30">
                <i class="bi bi-chevron-right"/>
              </button>

              <button class="btn btn-danger btn-sm me-2" @click="destroy">
                {{ $t('videoView.button.destroy') }}
              </button>

              <!--
                            <div class="fw-6 me-2">
                {{ durationMin }}/{{ (timecode / 60).toFixed(2) }}min
              </div>

              <button v-if="!muted" class="btn btn-primary btn-sm me-2" type="button" @click="muted=true">
                <i class="bi bi-volume-up"/>
              </button>

              <button v-else class="btn btn-outline-primary btn-sm me-2" type="button" @click="muted=false">
                <i class="bi bi-volume-mute"/>
              </button>

              <button v-if="paused" class="btn btn-warning btn-sm" type="button" @click="play()">
                <i class="bi bi-play"></i>
              </button>
              <button v-else class="btn btn-success btn-sm" type="button" @click="pause()">
                <i class="bi bi-pause"></i>
              </button>
              -->

              <button v-if="markings.length > 0" class="btn btn-warning btn-sm ms-2" type="button" @click="exportVideo">
                {{ $t('videoView.button.cut') }} <i class="bi bi-scissors"></i>
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
import { AxiosError } from 'axios';

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
  channel: string;
  file: string;
  fileUrl?: string;
  videoUrl: string;
  previewPath: string;
  stripePath: string;
  playbackSpeed: number;
}

const recording = new RecordingApi();

export default defineComponent({
  components: { Stripe },
  inject: [ 'fileUrl' ],
  props: {
    previewStripe: {
      type: String,
      required: true
    },
    pathRelative: {
      type: String,
      required: true
    },
    channelName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
  },
  data(): VideoData {
    return {
      videoUrl: this.fileUrl + '/recordings/' + this.channelName + '/' + this.filename,
      channel: this.channelName,
      file: this.filename,
      markings: [],
      previewPath: this.pathRelative,
      stripePath: this.fileUrl + '/' + this.previewStripe,
      show: true,
      loaded: false,
      paused: false,
      timecode: 0,
      duration: 0,
      segments: [],
      muted: true,
      playbackSpeed: 1.0,
    };
  },
  computed: {
    durationMin() {
      return (this.duration / 60).toFixed(2);
    },
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
    destroy() {
      if (!window.confirm(this.$t('videoView.destroy', [ this.filename ]))) {
        return;
      }
      recording.destroy(this.channelName, this.filename)
          .then(() => this.$router.back())
          .catch((err: AxiosError) => {
            alert(err.response?.data);
          });
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
            .catch((err: AxiosError) => alert(err.response?.data));
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
      if (this.$refs.video != null) {
        this.duration = (this.$refs.video as HTMLVideoElement).duration;
        this.loaded = true;
      }
    },
    timeupdate() {
      if (this.$refs.video != null) {
        this.timecode = (this.$refs.video as HTMLVideoElement).currentTime;
      }
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
