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

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { V1ChannelRequest as ChannelRequest, ModelsJob as JobResponse } from './services/api/v1/StreamSinkClient';
import { socket, MessageType } from "./utils/socket";
import ChannelModal from './components/modals/ChannelModal.vue';
import NavTop from './components/navs/NavTop.vue';
import { createClient } from './services/api/v1/ClientFactory';
import { useI18n } from "vue-i18n";
import { useStore } from "./store";
import axios from "axios";

const { t } = useI18n();
const store = useStore();

const api = createClient();

const title = window.VUE_APP_NAME;
const showModal = ref(false);

const routes = [
  { icon: 'bi-water', url: '/streams', title: t('menu.streams') },
  { icon: 'bi-list', url: '/overview', title: t('menu.overview') },
  { icon: 'bi-stopwatch', url: '/filter', title: t('menu.latest') },
  { icon: 'bi-hypnotize', url: '/random', title: t('menu.random') },
  { icon: 'bi-star-fill', url: '/bookmarks', title: t('menu.favs') },
  { icon: 'bi-list-check', url: '/jobs', title: t('menu.jobs') },
  { icon: 'bi-eye-fill', url: '/admin', title: t('menu.admin') }
];

const save = (data: ChannelRequest) => {
  api.channels.channelsCreate(data)
      .then(res => store.commit('addChannel', res.data))
      .catch(res => alert(res.error))
      .finally(() => showModal.value = false);
};

onBeforeMount(() => {
  // Dispatch
  socket.on(MessageType.JobCreate, data => store.commit('job:create', data));
  socket.on(MessageType.JobDestroy, data => store.commit('job:destroy', data));
  socket.on(MessageType.JobPreviewDone, data => store.commit('job:done', data));
  socket.on(MessageType.JobProgress, data => store.commit('job:progress', data));
  socket.on(MessageType.JobPreviewProgress, data => store.commit('job:preview:progress', data));

  socket.on(MessageType.ChannelOnline, data => store.commit('channel:online', data));
  socket.on(MessageType.ChannelOffline, data => store.commit('channel:offline', data));
  socket.on(MessageType.ChannelThumbnail, data => store.commit('channel:thumbnail', data));
  socket.on(MessageType.ChannelStart, data => store.commit('channel:start', data));

  api.jobs.jobsList()
      .then(result => result.data.forEach((job: JobResponse) => store.commit('addJob', job)))
      .catch(res => alert(res.error));
});
</script>

<style lang="scss">
@import "./assets/main.scss";
</style>