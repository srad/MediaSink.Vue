<template>
  <div class="modal show m-0 p-0m position-absolute" tabindex="-1" ref="modalVideo" style="display: block !important;">
    <div class="modal-dialog modal-fullscreen p-0">
      <div class="modal-content">
        <div class="modal-body bg-light p-0" style="overflow: hidden">

          <div class="d-flex flex-row" style="height: 90%;">

            <div class="d-flex flex-column m-0" :class="{'w-80': markings.length > 0, 'w-100': markings.length===0}">
              <video class="view h-100" controls
                     ref="video"
                     @volumechange="event => {cookies.set('muted', event.target.muted); cookies.set('volume', event.target.volume); }"
                     @loadeddata="loaddata"
                     @timeupdate="timeupdate" :muted="cookies.get<boolean>('muted')" autoplay>
                <source :src="videoUrl" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>

            <div v-if="markings.length > 0" class="d-flex flex-column m-0 p-2" :class="{'w-20': markings.length > 0}">
              <table class="table table-sm bg-white table-bordered text-center">
                <thead>
                <tr>
                  <th class="bg-light">{{ $t('videoView.segment.start') }}</th>
                  <th class="bg-light">{{ $t('videoView.segment.end') }}</th>
                  <th class="bg-light">
                    <i class="bi bi-trash text-danger"></i>
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr class="align-middle" :class="{'bg-secondary': marking.selected}" @click="selectMarking(marking)" :key="String(marking.timestart)+String(marking.timeend)" v-for="marking in markings">
                  <td>{{ (marking.timestart / 60).toFixed(1) }}min</td>
                  <td class="p-1">{{ (marking.timeend / 60).toFixed(1) }}min</td>
                  <td>
                    <button @click="destroyMarking(marking)" class="btn btn-sm bg-transparent">
                      <i class="bi bi-trash text-danger"></i>
                    </button>
                  </td>
                </tr>
                </tbody>
              </table>

              <button class="btn btn-primary" @click="playCut" v-if="!cutInterval">
                Play Cut <i class="bi bi-play-fill"></i>
              </button>
              <button v-else class="btn btn-primary" @click="stopCut">
                <span>Stop cut</span> <i class="bi bi-stop-fill"></i>
              </button>
              <button v-if="markings.length > 0" class="btn my-2 btn-warning" type="button" @click="exportVideo">
                {{ $t('videoView.button.cut') }} <i class="bi bi-scissors"></i>
              </button>
            </div>

          </div>

          <div ref="stripeContainer" class="d-flex flex-row w-100 position-relative overflow-y-scroll" style="height: 10%;">
            <Stripe :src="stripePath"
                    :disabled="cutInterval != undefined"
                    :paused="paused"
                    :timecode="timecode"
                    :duration="duration"
                    :markings="markings"
                    @width="stripeWidth"
                    @selecting="paused=true"
                    @marking="(m) => markings=m"
                    @seek="seek"
                    @offset="offset"/>
          </div>
        </div>

        <div class="modal-footer p-1" v-if="previewPath">
          <div class="d-flex justify-content-end">
            <button class="btn bg-primary text-white btn-sm me-2" @click="() => this.$refs.video.currentTime -= 30">
              <i class="bi bi-chevron-double-left"/>
            </button>

            <button class="btn bg-primary text-white btn-sm me-2" @click="() => this.$refs.video.currentTime += 30">
              <i class="bi bi-chevron-double-right"/>
            </button>

            <button class="btn btn-danger btn-sm me-2" @click="destroy">
              <i class="bi bi-trash3-fill"/>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
//import socket from "@/socket";
//import event from "@/services/event";
import { createClient } from "@/services/api/v1/ClientFactory";
import { defineComponent } from 'vue';
import { Marking } from '@/components/Stripe.vue';
import Stripe from '@/components/Stripe.vue';
import { useCookies } from '@vueuse/integrations/useCookies';

interface VideoData {
  isMounted: boolean;
  cutInterval?: number;
  markings: any[];
  show: boolean;
  loaded: boolean;
  paused: boolean;
  timecode: number;
  duration: number;
  segments: any[],
  stripeWidth: number;
  baseUrl?: string;
  channel: string;
  file: string;
  fileUrl?: string;
  videoUrl: string;
  previewPath: string;
  stripePath: string;
  playbackSpeed: number;
}

const api = createClient();

export default defineComponent({
  setup() {
    const cookies = useCookies([ 'locale' ]);
    return {
      cookies,
    };
  },
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
      stripeWidth: 0,
      isMounted: false,
      videoUrl: this.fileUrl + '/' + this.channelName + '/' + this.filename,
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
      if (this.isMounted) {
        (this.$refs.video as HTMLVideoElement).muted = val;
      }
    },
    paused(val) {
      if (!this.isMounted) {
        return;
      }

      const video = this.$refs.video as HTMLVideoElement;

      if (val) {
        video.pause();
      } else {
        video.play();
      }
    },
    playbackSpeed(newVal) {
      if (!this.isMounted) {
        return;
      }

      (this.$refs.video as HTMLVideoElement).playbackRate = newVal;
    },
  },
  methods: {
    stopCut() {
      const video = this.$refs.video as HTMLVideoElement;
      video.pause();
      clearInterval(this.cutInterval);
      this.cutInterval = undefined;
    },
    playCut() {
      if (this.markings.length == 0) {
        return;
      }

      let i = 0;

      const lastTime = this.markings[this.markings.length - 1].timeend;
      let marking = this.markings[i];

      const video = this.$refs.video as HTMLVideoElement;
      video.currentTime = marking.timestart;
      video.play();

      this.cutInterval = setInterval(() => {
        requestAnimationFrame(() => {
          if (video.currentTime >= lastTime) {
            this.stopCut();
          } else {
            marking = this.markings[i];
            if (video.currentTime >= marking.timeend) {
              marking = this.markings[++i];
              video.currentTime = marking.timestart;
            }
          }
        });
      }, 100);
    },
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
      api.recordings.recordingsDelete(this.channelName, this.filename)
          .then(() => this.$router.back())
          .catch((err) => {
            alert(err);
          });
    },
    exportVideo() {
      if (window.confirm('Export selected segments?')) {
        const starts = this.markings.map(m => String(m.timestart.toFixed(4)));
        const ends = this.markings.map(m => String(m.timeend.toFixed(4)));

        api.recordings.cutCreate(
            this.$route.params.channelName as string,
            this.$route.params.filename as string,
            { starts, ends })
            .then(() => {
              this.markings = [];
            })
            .catch((err) => alert(err));
      }
    },
    isPaused() {
      return (this.$refs.video as HTMLVideoElement).paused;
    },
    seek({ clientX, width }: { clientX: number, width: number }) {
      this.paused = true;
      const div = this.$refs.stripeContainer as HTMLDivElement;
      const video = this.$refs.video as HTMLVideoElement;

      const offset = video.duration * (clientX / width);

      if (isNaN(offset)) {
        return;
      }

      video.currentTime = offset;
    },
    offset(offset: number, clientX: number) {
      requestAnimationFrame(() => {
        const div = this.$refs.stripeContainer as HTMLDivElement;
        //(this.$refs.stripeContainer as HTMLDivElement).scrollLeft = left - window.innerWidth / 2;
        //div.scrollLeft = clientX;
      });
    },
    loaddata() {
      if (this.isMounted) {
        const video = this.$refs.video as HTMLVideoElement;
        this.duration = video.duration;
        this.loaded = true;
        video.volume = this.cookies.get('volume') || 0.0;
      }
    },
    timeupdate() {
      if (this.isMounted) {
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
    this.isMounted = true;
    window.addEventListener('orientationchange', this.rotate);
    this.show = true;
  },
});
</script>