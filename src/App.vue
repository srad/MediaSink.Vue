<template>
  <NavTop :routes="routes" :title="title" @add="showModal=true"/>

  <main class="container-fluid">
    <router-view v-slot="{ Component }">
      <keep-alive include="[StreamView]">
        <component :is="Component" class="py-2"/>
      </keep-alive>
    </router-view>

    <ChannelModal
        :clear="showModal"
        :show="showModal"
        :is-paused="false"
        title="Add Stream"
        @save="save"
        @close="showModal=false"/>
  </main>
</template>

<script lang="ts">
import { ChannelRequest, ChannelResponse, ChannelApi } from './services/api/v1/channelApi';
import { JobApi, JobResponse } from '@/services/api/v1/jobApi';
import { AxiosError, AxiosResponse } from 'axios';
import { defineComponent } from 'vue';
import socket from '@/utils/socket';
import ChannelModal from '@/components/modals/ChannelModal.vue';
import NavSidebar from '@/components/navs/NavSidebar.vue';
import NavTop from '@/components/navs/NavTop.vue';

const channel = new ChannelApi();
const jobApi = new JobApi();

interface AppData {
  title: string;
  showModal: boolean;
  recording: boolean;
  online: boolean;
  routes: { icon: string, url: string, title: string }[];
}

export default defineComponent({
  name: 'App',
  inject: ['socketUrl'],
  components: { NavTop, ChannelModal, NavSidebar },
  data(): AppData {
    return {
      title: process.env.VUE_APP_NAME,
      showModal: false,
      recording: false,
      online: false,
      routes: [
        { icon: 'bi-water', url: '/streams', title: 'Streams' },
        { icon: 'bi-stopwatch', url: '/filter', title: 'Filter' },
        { icon: 'bi-hypnotize', url: '/random', title: 'Random' },
        { icon: 'bi-star-fill', url: '/bookmarks', title: 'Favs' },
        { icon: 'bi-list-check', url: '/jobs', title: 'Jobs' },
        { icon: 'bi-eye-fill', url: '/admin', title: 'Admin' }
      ]
    };
  },
  methods: {
    save(data: ChannelRequest) {
      channel.add(data)
          .then((res: AxiosResponse<ChannelResponse>) => {
            this.showModal = false;
            this.$store.commit('addChannel', res.data);
            this.showModal = false;
          })
          .catch((err: AxiosError) => {
            alert(err.response?.data);
            this.showModal = false;
          });
    },
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
</style>
