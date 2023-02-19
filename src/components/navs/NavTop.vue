<template>
  <nav class="navbar navbar-expand-lg sticky-top shadow-sm m-0 d-flex bg-primary">
    <div class="container-fluid">
      <AppBrand class="mr-auto" :title="title"/>

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

      <DiskStatus :pcent="diskInfo.pcent"/>
      <RecordingControls :jobs="jobs" :recording="recording" @add="$emit('add')" @record="record"/>

      <button class="text-white fs-1 navbar-toggler collapsed align-items-end" type="button" data-bs-toggle="collapse" @click="toggle" data-bs-target="#collapsibleNavbar" style="cursor:pointer" aria-expanded="false">
        <span class="bi bi-list"></span>
      </button>
    </div>
  </nav>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { DiskInfo, InfoApi } from '@/services/api/v1/infoApi';
import { RecordingApi } from '@/services/api/v1/recordingApi';
import { JobResponse } from '@/services/api/v1/jobApi';
import { AxiosError } from 'axios';
import DiskStatus from '@/components/DiskStatus.vue';
import RecordingControls from '@/components/RecordingControls.vue';
import AppBrand from '@/components/AppBrand.vue';

const recording = new RecordingApi();
const info = new InfoApi();

interface NavTopData {
  collapseNav: boolean;
  diskInfo: DiskInfo;
  recording: boolean;
}

export default defineComponent({
  components: { AppBrand, RecordingControls, DiskStatus },
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
    jobs(): JobResponse[] {
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
