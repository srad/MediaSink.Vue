<template>
  <NavTop :routes="routes" :title="title" @add="showModal=true"/>

  <main class="container-fluid" style="padding-top: 3.5rem">
    <router-view v-slot="{ Component }">
      <keep-alive include="[StreamView]">
        <component :is="Component"/>
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
import { V1ChannelRequest as ChannelRequest, ModelsJob as JobResponse } from './services/api/v1/StreamSinkClient';
import { defineComponent } from 'vue';
import socket from '@/utils/socket';
import ChannelModal from '@/components/modals/ChannelModal.vue';
import NavSidebar from '@/components/navs/NavSidebar.vue';
import NavTop from '@/components/navs/NavTop.vue';
import { createClient } from '@/services/api/v1/ClientFactory';

const api = createClient();

interface AppData {
  title: string;
  showModal: boolean;
  recording: boolean;
  online: boolean;
  routes: { icon: string, url: string, title: string }[];
}

export default defineComponent({
  name: 'App',
  inject: [ 'socketUrl' ],
  components: { NavTop, ChannelModal, NavSidebar },
  data(): AppData {
    return {
      title: window.VUE_APP_NAME,
      showModal: false,
      recording: false,
      online: false,
      routes: [
        { icon: 'bi-water', url: '/streams', title: this.$t('menu.streams') },
        { icon: 'bi-stopwatch', url: '/filter', title: this.$t('menu.latest') },
        { icon: 'bi-hypnotize', url: '/random', title: this.$t('menu.random') },
        { icon: 'bi-star-fill', url: '/bookmarks', title: this.$t('menu.favs') },
        { icon: 'bi-list-check', url: '/jobs', title: this.$t('menu.jobs') },
        { icon: 'bi-eye-fill', url: '/admin', title: this.$t('menu.admin') }
      ]
    };
  },
  methods: {
    save(data: ChannelRequest) {
      api.channels.channelsCreate(data)
          .then(res => this.$store.commit('addChannel', res.data))
          .catch(err => alert(err.response?.data))
          .finally(() => this.showModal = false);
    },
  },
  created() {
    // Dispatch
    socket.on('job:create', data => this.$store.commit('job:create', data));
    socket.on('job:destroy', data => this.$store.commit('job:destroy', data));
    socket.on('job:preview:done', data => this.$store.commit('job:preview:done', data));
    socket.on('job:progress', data => this.$store.commit('job:progress', data));
    socket.on('job:preview:progress', data => this.$store.commit('job:preview:progress', data));
    api.jobs.jobsList()
        .then(result => result.data.forEach((job: JobResponse) => this.$store.commit('addJob', job)))
        .catch(err => alert(err.response?.data));
  }
});
</script>

<style lang="scss">
@import "./assets/main.scss";
</style>
