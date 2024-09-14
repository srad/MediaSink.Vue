<template>
  <NavTop v-if="loggedIn" :routes="routes" :title="title" @add="showModal=true" :show-logout="loggedIn" @logout="logout"/>

  <main class="container-fluid" :data-logged-in="loggedIn">
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <KeepAlive include="SteamView,ChannelsView,JobView">
          <suspense>
            <!-- main content -->
            <component :is="Component"></component>

            <!-- loading state -->
            <template #fallback>
              <div class="d-flex justify-content-center my-3">
                <div class="text-center">
                  <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </template>
          </suspense>
        </KeepAlive>
      </template>
    </RouterView>

    <ChannelModal
        :clear="showModal"
        :show="showModal"
        :is-paused="false"
        title="Add Stream"
        @save="save"
        @close="showModal=false"/>

    <Toaster :toasts="toasts"/>
  </main>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { DatabaseJob, RequestsChannelRequest as ChannelRequest } from './services/api/v1/StreamSinkClient';
import { createSocket, MessageType } from './utils/socket';
import ChannelModal from './components/modals/ChannelModal.vue';
import NavTop from './components/navs/NavTop.vue';
import { createClient, MyClient } from './services/api/v1/ClientFactory';
import { useI18n } from 'vue-i18n';
import { TaskInfo, useStore } from './store';
import router from "./route.ts";
import Toaster from "./components/Toaster.vue";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const { t } = useI18n();
const store = useStore();

let api: MyClient | null = null;
const socket = createSocket();

const title = inject('appName') as string;
const showModal = ref(false);

const toasts = computed(() => store.getters.getToast);

const routes = [
  { icon: 'bi-water', url: '/streams', title: t('menu.streams') },
  { icon: 'bi-list', url: '/channels', title: t('menu.channels') },
  { icon: 'bi-stopwatch', url: '/filter', title: t('menu.latest') },
  { icon: 'bi-hypnotize', url: '/random', title: t('menu.random') },
  { icon: 'bi-star-fill', url: '/bookmarks', title: t('menu.favs') },
  { icon: 'bi-eye-fill', url: '/admin', title: t('menu.admin') }
];

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const save = (data: ChannelRequest) => {
  api?.channels.channelsCreate(data)
      .then(res => store.commit('addChannel', res.data))
      .catch(res => alert(res.error))
      .finally(() => showModal.value = false);
};

const logout = () => {
  store.dispatch('logout');
  router.push("/login");
};

const connector = (loggedIn: boolean) => {
  if (loggedIn) {
    socket.connect();
    api = createClient();
    api.jobs.jobsDetail(0, 100).then(res => store.commit('jobs:update', res.data.jobs));
  } else {
    socket.close();
  }
};

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const loggedIn = computed(() => store.getters.isLoggedIn);

watch(loggedIn, loggedIn => connector(loggedIn));

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  connector(loggedIn.value);

  socket.on(MessageType.JobStart, data => {
    const job = data as TaskInfo;
    store.commit('job:start', job);
  });
// Dispatch
  socket.on(MessageType.JobCreate, data => {
    const job = data as DatabaseJob;
    store.commit('job:create', job);
    store.commit('toast:add', { title: 'Job created', message: `File ${job.filename} in ${job.channelName}` });
  });

  socket.on(MessageType.JobDestroy, data => {
    const d = data as TaskInfo;
    const job = d.job;
    store.commit('job:destroy', job);
    store.commit('toast:add', { title: 'Job destroyed', message: `File ${job.filename} in ${job.channelName}` });
  });

  socket.on(MessageType.JobPreviewDone, data => {
    const d = data as TaskInfo;
    const job = d.job;
    store.commit('job:done', job);
    store.commit('toast:add', { title: 'Job done', message: `File ${job.filename} in ${job.channelName}` });
  });
  socket.on(MessageType.JobDeleted, data => store.commit('job:deleted', data));
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
});

</script>

<style lang="scss">
@import "./assets/main.scss";
</style>