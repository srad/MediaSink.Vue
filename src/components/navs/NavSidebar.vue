<template>
  <div class="bg-primary d-flex flex-column flex-shrink-0 p-3 vh-100 h-100" style="width: 220px;">
    <a class="navbar-brand d-none d-lg-block text-white fw-bold" href="/streams">
      <span class="d-none d-lg-inline p-2">{{ title }}</span>
      <i class="bi bi-water" style="color: deepskyblue"></i>
    </a>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item" v-for="link in routes" :key="link">
        <router-link :to="link.url" :custom="true" exact-active-class="bg-white" v-slot="{ navigate, href, isActive }">
          <a :href="href" :class="{active: isActive}" @click="navigate" class="nav-link text-white">
            <i class="bi text-white" :class="link.icon"></i>
            {{ link.title }}
          </a>
        </router-link>
      </li>
    </ul>
    <hr>
    <div class="btn-group">
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
  </div>
  <!--
  <nav class="navbar navbar-expand-lg shadow-sm m-0 d-flex bg-primary justify-content-between">
    <div class="container-fluid">
      <a class="navbar-brand d-none d-lg-block text-white fw-bold" href="/streams">
        <span class="d-none d-lg-inline p-2">{{ title }}</span>
        <i class="bi bi-water" style="color: deepskyblue"></i>
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
  -->
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { createClient } from '@/services/api/v1/ClientFactory';
import { UtilsDiskInfo as DiskInfo, ModelsJob as JobResponse } from '@/services/api/v1/StreamSinkClient';

const api = createClient();

interface NavData {
  collapseNav: boolean;
  diskInfo: DiskInfo;
  recording: boolean;
}

export default defineComponent({
  props: {
    routes: { type: Array, required: true },
    title: { type: String, required: true },
  },
  watch: {
    $route() {
      this.collapseNav = true;
    }
  },
  computed: {
    jobs(): JobResponse[] {
      //@ts-ignore
      return this.$store.state.jobs.slice().filter(job => job.status !== 'recording');
    }
  },
  data(): NavData {
    return {
      diskInfo: { avail: '', pcent: '', size: '', used: '' },
      collapseNav: true,
      recording: false,
    };
  },
  name: 'NavSidebar',
  methods: {
    toggle() {
      this.collapseNav = !this.collapseNav;
    },
    async query() {
      const response = await api.recorder.recorderList();
      this.recording = response.data;

      const response2 = await api.info.diskList();
      this.diskInfo = response2.data;
    },
    async record(resume: boolean) {
      if (resume) {
        if (window.confirm('Start recording?')) {
          try {
            await api.recorder.resumeCreate();
            this.recording = true;
          } catch (ex) {
            alert(ex);
          }
        }
      } else {
        if (window.confirm('Do you want to stop all recordings?')) {
          try {
            await api.recorder.pauseCreate();
            this.$store.commit('stopChannels');
            this.recording = false;
          } catch (ex) {
            alert(ex);
          }
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
