<template>
  <main>
    <nav class="navbar navbar-expand-lg sticky-top shadow-sm m-0 d-flex bg-primary justify-content-between">
      <div class="container-fluid">
        <a class="navbar-brand d-none d-lg-block text-white fw-bold" href="/streams">
          <span class="d-none d-lg-inline p-2">{{ title }}</span>
          <i class="bi bi-water" style="color: deepskyblue"></i>
        </a>

        <div class="navbar-collapse collapse px-2 mb-1" :class="{'d-none': collapseNav}" id="collapsibleNavbar">
          <ul class="navbar-nav">
            <li class="nav-item" v-for="link in links" :key="link">
              <router-link :to="link.url" :custom="true" exact-active-class="active" v-slot="{ navigate, href, isActive }">
                <a :href="href" :class="{active: isActive}" @click="navigate" class="nav-link text-white">
                  {{ link.title }}
                </a>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="text-white d-flex justify-content-between align-middle me-3 d-none d-lg-flex">
          <span class="fw-bold me-2 ">
            {{ diskInfo.pcent }}
            <i class="bi bi-hdd"></i>
          </span>
          <span class="progress m-1" style="min-width: 120px">
            <span class="progress-bar bg-info progress-bar-striped"
                  role="progressbar"
                  :style="{width: diskInfo.pcent}"
                  :aria-valuenow="parseInt(diskInfo.pcent)"
                  aria-valuemin="0"
                  aria-valuemax="100">
            </span>
          </span>
        </div>

        <div class="dropdown">
          <button :disabled="jobs.length === 0" type="button" class="position-relative me-2 btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            Jobs
            <span v-if="jobs.length > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ jobs.length }}
              <span class="visually-hidden">open jobs</span>
            </span>
          </button>
          <ul class="dropdown-menu">
            <template :key="job.filename" v-for="job in jobs">
              <li v-if="job.status!=='recording'">
                <a class="dropdown-item" href="#">{{ job.filename }} ({{ job.status }})</a>
              </li>
            </template>
          </ul>
        </div>

        <div>
          <button v-if="!recording" class="btn btn-secondary" @click="record(true)">
            <i class="bi bi-record-fill"></i>
            start
          </button>
          <button v-else class="btn btn-danger blink" @click="record(false)">
            <i class="bi bi-stop-fill"></i>
            stop
          </button>
          <button class="btn btn-success text-white ms-2" @click="showModal=true">
            Add Stream
          </button>
        </div>

        <button class="text-white fs-1 navbar-toggler collapsed" type="button" data-bs-toggle="collapse" @click="toggle" data-bs-target="#collapsibleNavbar" style="cursor:pointer" aria-expanded="false">
          <span class="bi bi-list"></span>
        </button>
      </div>
    </nav>

    <div class="container-fluid py-3">
      <router-view v-slot="{ Component }">
        <keep-alive include="[StreamView]">
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>

    <ChannelModal :clear="showModal" :show="showModal" title="Add Stream" @save="save" @close="showModal=false"/>
  </main>
</template>

<script lang="ts">
import { ChannelRequest, ChannelResponse, ChannelApi } from './services/api/v1/channelApi';
import { RecordingApi } from './services/api/v1/recordingApi';
import { DiskInfo, InfoApi } from '@/services/api/v1/infoApi';
import { defineComponent } from 'vue';
import socket from '@/utils/socket';
import ChannelModal from '@/components/modals/ChannelModal.vue';

const channel = new ChannelApi();
const recording = new RecordingApi();
const info = new InfoApi();
const jobApi = new JobApi();
import { JobApi, JobResponse } from '@/services/api/v1/jobApi';
import { AxiosError, AxiosResponse } from 'axios';

interface AppData {
  title: string;
  showModal: boolean;
  recording: boolean;
  online: boolean;
  collapseNav: boolean;
  links: { url: string, title: string }[];
  diskInfo: DiskInfo;
}

export default defineComponent({
  name: 'App',
  inject: ['socketUrl'],
  components: { ChannelModal },
  data(): AppData {
    return {
      diskInfo: { avail: '', pcent: '', size: '', used: '' },
      title: process.env.VUE_APP_NAME,
      showModal: false,
      recording: false,
      online: false,
      collapseNav: true,
      links: [
        { url: '/streams', title: 'Streams' },
        { url: '/gallery/latest', title: 'Latest' },
        { url: '/gallery/random', title: 'Random' },
        { url: '/favs', title: 'Favs' },
        { url: '/jobs', title: 'Jobs' },
        { url: '/admin', title: 'Admin' }
      ]
    };
  },
  computed: {
    jobs() {
      //@ts-ignore
      return this.$store.state.jobs.slice().filter(job => job.status !== 'recording');
    }
  },
  watch: {
    $route() {
      this.collapseNav = true;
    }
  },
  methods: {
    toggle() {
      this.collapseNav = !this.collapseNav;
    },
    async save(data: ChannelRequest) {
      channel.add(data)
          .then((res: AxiosResponse<ChannelResponse>) => {
            this.showModal = false;
            this.$store.commit('addChannel', res.data);
            this.showModal = false;
          })
          .catch((err: AxiosError) => {
            alert(err);
            this.showModal = false;
          });
    },
    record(resume: boolean) {
      if (resume) {
        if (window.confirm('Start recording?')) {
          recording.resume().then(() => {
            this.recording = true;
          }).catch((err: AxiosError) => {
            alert(err.response?.data);
          });
        }
      } else {
        if (window.confirm('Do you want to stop all recordings?')) {
          recording.pause().then(() => {
            this.$store.commit('stopChannels');
            this.recording = false;
          }).catch((err: AxiosError) => {
            alert(err.response?.data);
          });
        }
      }
    },
    query() {
      recording.isRecording().then(res => this.recording = res.data);
      info.disk().then(res => this.diskInfo = res.data);
    }
  },
  mounted() {
    this.query();
    setInterval(this.query, 10 * 1000);
  },
  created() {
    socket.on('job:create', data => this.$store.commit('job:create', data));
    socket.on('job:destroy', data => this.$store.commit('job:destroy', data));
    socket.on('job:preview:done', data => this.$store.commit('job:preview:done', data));
    socket.on('job:preview:progress', data => this.$store.commit('job:preview:progress', data));
    jobApi.fetch()
        .then(result => result.data.forEach((job: JobResponse) => this.$store.commit('addJob', job)))
        .catch((err: AxiosError) => alert(err.response?.data));
  }
});
</script>

<style lang="scss">
@import "./assets/main.scss";

video.view {
  height: 100%;
  width: 100%;
  max-height: 100%
}

video.edit {
  height: 90%;
  width: 100%;
  max-height: 90%
}
</style>
