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
import { useI18n } from 'vue-i18n';
import { useStore } from './store';
import router from './route.ts';
import Toaster from './components/Toaster.vue';
import { ChannelAction, ChannelMutation } from './store/modules/channel.ts';
import { JobAction, JobMutation, TaskInfo } from './store/modules/job.ts';
import { ToastMutation } from './store/modules/toast.ts';
import { AuthAction } from './store/modules/auth.ts';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const { t } = useI18n();
const store = useStore();

const socket = createSocket();

const title = inject('appName') as string;
const showModal = ref(false);

const toasts = computed(() => store.getters['toast/getToast']);

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

const save = (data: ChannelRequest) => store.dispatch(ChannelAction.Save, data)
    .catch(err => alert(err))
    .finally(() => showModal.value = false);

const logout = () => {
  store.dispatch(AuthAction.Logout);
  router.push('/login');
};

const connector = async (loggedIn: boolean) => {
  if (loggedIn) {
    socket.connect();
    await store.dispatch(JobAction.Load);
  } else {
    socket.close();
  }
};

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const loggedIn = computed(() => store.getters['auth/isLoggedIn']);

watch(loggedIn, loggedIn => connector(loggedIn));

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  await connector(loggedIn.value);

  socket.on(MessageType.JobStart, data => {
    const job = data as TaskInfo;
    store.commit(JobMutation.Start, job);
  });
  // Dispatch
  socket.on(MessageType.JobCreate, data => {
    const job = data as DatabaseJob;
    store.dispatch(JobAction.Create, job);
    store.commit(ToastMutation.Add, { title: 'Job created', message: `File ${job.filename} in ${job.channelName}` });
  });

  socket.on(MessageType.JobDestroy, data => {
    const d = data as TaskInfo;
    const job = d.job;
    store.commit(JobMutation.Delete, job);
    store.commit(ToastMutation.Add, { title: 'Job destroyed', message: `File ${job.filename} in ${job.channelName}` });
  });

  socket.on(MessageType.JobPreviewDone, data => {
    const d = data as TaskInfo;
    const job = d.job;
    store.dispatch(JobAction.Done, job);
    store.commit(ToastMutation.Add, { title: 'Job done', message: `File ${job.filename} in ${job.channelName}` });
  });
  socket.on(MessageType.JobDeleted, data => store.commit(JobMutation.Delete, data));
  socket.on(MessageType.JobProgress, data => store.commit(JobMutation.Progress, data));
  socket.on(MessageType.JobPreviewProgress, data => store.commit(JobMutation.Progress, data));

  socket.on(MessageType.ChannelOnline, data => store.commit(ChannelMutation.Online, data));
  socket.on(MessageType.ChannelOffline, data => store.commit(ChannelMutation.Offline, data));
  socket.on(MessageType.ChannelThumbnail, data => store.commit(ChannelMutation.Thumbnail, data));

  socket.on(MessageType.ChannelStart, data => {
    const id = data as number;
    store.commit(ChannelMutation.Start, id);
    store.commit(ToastMutation.Add, { title: 'Channel recording', message: `Channel id ${id}` });
  });
});
</script>

<style lang="scss">
@import "./assets/main.scss";
</style>
