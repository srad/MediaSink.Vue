<template>
  <nav class="navbar navbar-dark navbar-expand-lg fixed-top m-0 d-flex bg-primary">
    <div class="container-fluid">
      <AppBrand class="mr-auto" :title="title"/>

      <div class="offcanvas offcanvas-end bg-dark" data-bs-backdrop="static" tabindex="-1" aria-labelledby="collapsibleNavbarLabel" id="collapsibleNavbar">
        <div class="offcanvas-header bg-primary text-white">
          <AppBrand class="mr-auto" :title="title"/>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1">
            <li class="nav-item" v-for="link in routes" :key="link">
              <router-link :to="link.url" :custom="true" exact-active-class="active" v-slot="{ navigate, href, isActive }">
                <a :href="href" :class="{active: isActive}" @click="navigate" class="nav-link">
                  <span data-bs-dismiss="offcanvas" data-bs-target="#collapsibleNavbar">{{ link.title }}</span>
                </a>
              </router-link>
            </li>
            <li class="nav-item d-flex align-items-center">
              <DiskStatus :pcent="diskInfo.pcent"/>
            </li>
            <li class="nav-item d-none d-lg-block">
              <RecordingControls :jobs="jobs" :recording="recording" @add="$emit('add')" @record="record"/>
            </li>
          </ul>
        </div>
      </div>

      <div class="d-lg-none">
        <RecordingControls :jobs="jobs" :recording="recording" @add="$emit('add')" @record="record"/>
      </div>

      <button class="navbar-toggler d-l-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#collapsibleNavbar" aria-controls="collapsibleNavbar" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DatabaseJob as JobResponse, HelpersDiskInfo as DiskInfo } from '@/services/api/v1/StreamSinkClient';
import { createClient } from '@/services/api/v1/ClientFactory';
import DiskStatus from '@/components/DiskStatus.vue';
import RecordingControls from '@/components/RecordingControls.vue';
import AppBrand from '@/components/AppBrand.vue';

const api = createClient();

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
  emits: [ 'add' ],
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
    async query() {
      this.recording = await api.isRecording();
      const diskRes = await api.info.diskList();
      this.diskInfo = diskRes.data;
    },
    async record(resume: boolean) {
      try {
        if (resume) {
          if (window.confirm('Start recording?')) {
            await api.recorder.resumeCreate();
            this.recording = true;
          }
        } else {
          if (window.confirm('Do you want to stop all recordings?')) {
            await api.recorder.pauseCreate();
            this.$store.commit('stopChannels');
            this.recording = false;
          }
        }
      } catch (e) {
        alert(e);
      }
    }
  },
  async mounted() {
    await this.query();
    setInterval(async () => await this.query(), 10 * 1000);
  },
});
</script>