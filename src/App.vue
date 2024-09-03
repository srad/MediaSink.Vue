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

    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div v-for="toast in toasts" class="toast border-dark" :class="{'show': toast.hide !== true}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-info-light">
          <strong class="me-auto">{{ toast.title }}</strong>
          <button type="button" class="btn-close" @click="() => store.commit('toast:hide', toast)" aria-label="Close"></button>
        </div>
        <div class="toast-body bg-secondary-subtle text-dark">
          <div>
            {{ toast.message }}
          </div>
          <div style="height: 3px;" :style="{'width': toast.countdown + '%'}" class="mt-2 bg-warning"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeMount, ref } from 'vue';
import { V1ChannelRequest as ChannelRequest, ModelsJob as JobResponse } from './services/api/v1/StreamSinkClient';
import { socket, MessageType } from './utils/socket';
import ChannelModal from './components/modals/ChannelModal.vue';
import NavTop from './components/navs/NavTop.vue';
import { createClient } from './services/api/v1/ClientFactory';
import { useI18n } from 'vue-i18n';
import { JobMessage, useStore } from './store';

const { t } = useI18n();
const store = useStore();

const api = createClient();

const title = inject('appName') as string;
const showModal = ref(false);

const toasts = computed(() => store.getters.getToast);

const routes = [
  { icon: 'bi-water', url: '/streams', title: t('menu.streams') },
  { icon: 'bi-list', url: '/overview', title: t('menu.overview') },
  { icon: 'bi-stopwatch', url: '/filter', title: t('menu.latest') },
  { icon: 'bi-hypnotize', url: '/random', title: t('menu.random') },
  { icon: 'bi-star-fill', url: '/bookmarks', title: t('menu.favs') },
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
  socket.on(MessageType.JobCreate, data => {
    const job = data as JobMessage;
    store.commit('job:create', job);
    store.commit('toast:add', { title: 'Job created', message: `File ${job.filename} in ${job.channelName}` });
  });

  socket.on(MessageType.JobDestroy, data => {
    const job = data as JobMessage;
    store.commit('job:destroy', job);
    store.commit('toast:add', { title: 'Job destroyed', message: `File ${job.filename} in ${job.channelName}` });
  });

  socket.on(MessageType.JobPreviewDone, data => {
    const job = data as JobMessage;
    store.commit('job:done', job);
    store.commit('toast:add', { title: 'Job done', message: `File ${job.filename} in ${job.channelName}` });
  });
  socket.on(MessageType.JobProgress, data => store.commit('job:progress', data));
  socket.on(MessageType.JobPreviewProgress, data => store.commit('job:preview:progress', data));

  socket.on(MessageType.ChannelOnline, data => store.commit('channel:online', data));
  socket.on(MessageType.ChannelOffline, data => store.commit('channel:offline', data));
  socket.on(MessageType.ChannelThumbnail, data => store.commit('channel:thumbnail', data));

  socket.on(MessageType.ChannelStart, data => {
    const id = data as number;
    store.commit('channel:start', id);
    store.commit('toast:add', { title: 'Channel recording', message: `Channel id ${id}` });
  });

  api.jobs.jobsList()
      .then(result => result.data.forEach((job: JobResponse) => store.commit('addJob', job)))
      .catch(err => store.commit('error', err));
});
</script>

<style lang="scss">
@import "./assets/main.scss";
</style>
