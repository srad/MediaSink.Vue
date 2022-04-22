<template>
  <nav class="navbar navbar-expand-lg sticky-top shadow-sm m-0 d-flex bg-primary justify-content-between">
    <div class="container-fluid">
      <a class="navbar-brand d-none d-lg-block text-white fw-bold" href="/streams">
        <span class="d-none d-lg-inline p-2">{{ title }}</span>
        <img style="height: 28px; width: auto" src="/icon.png"/>
      </a>

      <div class="navbar-collapse collapse px-2 mb-1" :class="{'d-none': collapseNav}" id="collapsibleNavbar">
        <ul class="navbar-nav">
          <li class="nav-item" v-for="link in routes" :key="link">
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

      <button @click="$router.push('/jobs')" v-if="jobs.length > 0" type="button" class="position-relative me-2 btn btn-info" data-bs-toggle="dropdown" aria-expanded="false">
        {{ $t("menu.jobs") }} ({{ jobs.length }})
        <div v-if="jobs.length > 0" class="spinner-border text-dark spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </button>

      <div>
        <button v-if="!recording" class="btn btn-secondary" @click="record(true)">
          <i class="bi bi-record-fill"></i>
          start
        </button>
        <button v-else class="btn btn-danger blink" @click="record(false)">
          <i class="bi bi-stop-fill"></i>
          stop
        </button>
        <button class="btn btn-success text-white ms-2" @click="$emit('add')">
          Add Stream
        </button>
      </div>

      <button class="text-white fs-1 navbar-toggler collapsed" type="button" data-bs-toggle="collapse" @click="toggle" data-bs-target="#collapsibleNavbar" style="cursor:pointer" aria-expanded="false">
        <span class="bi bi-list"></span>
      </button>
    </div>
  </nav>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { DiskInfo, InfoApi } from '@/services/api/v1/infoApi';
import { RecordingApi } from '@/services/api/v1/recordingApi';
import { AxiosError } from 'axios';

const recording = new RecordingApi();
const info = new InfoApi();

interface NavTopData {
  collapseNav: boolean;
  diskInfo: DiskInfo;
  recording: boolean;
}

export default defineComponent({
  props: {
    routes: { type: Array, required: true },
    title: { type: String, required: true },
  },
  emits: ['add'],
  watch: {
    $route() {
      this.collapseNav = true;
    }
  },
  computed: {
    jobs() {
      //@ts-ignore
      return this.$store.state.jobs.slice().filter(job => job.status !== 'recording');
    }
  },
  data(): NavTopData {
    return {
      diskInfo: { avail: '', pcent: '', size: '', used: '' },
      collapseNav: true,
      recording: false,
    };
  },
  name: 'NavTop',
  methods: {
    toggle() {
      this.collapseNav = !this.collapseNav;
    },
    query() {
      recording.isRecording().then(res => this.recording = res.data);
      info.disk().then(res => this.diskInfo = res.data);
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
  },
  mounted() {
    this.query();
    setInterval(this.query, 10 * 1000);
  },
});
</script>

<style scoped>

</style>
