<template>
  <div>
    <NavTop :routes="routes" :title="title" @add="showModal = true" :show-logout="true" @logout="logout"/>
    <main class="container-fluid" style="margin-top: 4rem">
      <slot></slot>
      <ChannelModal :clear="showModal" :show="showModal" :is-paused="false" :saving="false" title="Add Stream" @save="save" @close="showModal = false"/>
      <AppToaster :toasts="toastStore.all" @destroy="toast => toastStore.destroy(toast)"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import { type DatabaseJob, type RequestsChannelRequest as ChannelRequest } from "@/services/api/v1/StreamSinkClient";
import { MessageType, SocketManager } from "@/utils/socket";
import ChannelModal from "@/components/modals/ChannelModal.vue";
import NavTop from "@/components/navs/NavTop.vue";
import { useChannelStore } from "@/stores/channel";
import { type JobMessage, type TaskComplete, type TaskInfo, type TaskProgress, useJobStore } from "@/stores/job";
import { useToastStore } from "@/stores/toast";
import { inject, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppToaster from "@/components/AppToaster.vue";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

// Stores
const channelStore = useChannelStore();
const toastStore = useToastStore();
const jobStore = useJobStore();
const authStore = useAuthStore();

const { t } = useI18n();

const title = inject("appName") as string;
const saving = ref(false);

const router = useRouter();
const route = useRoute();

const showModal = ref(false);

const socketManager = new SocketManager();

const routes = [
  { icon: "bi-water", url: "/streams/live", title: t("menu.streams") },
  { icon: "bi-list", url: "/channels", title: t("menu.channels") },
  { icon: "bi-stopwatch", url: "/filter", title: t("menu.latest") },
  { icon: "bi-hypnotize", url: "/random", title: t("menu.random") },
  { icon: "bi-heart-fill", url: "/bookmarks", title: t("menu.favs") },
  { icon: "bi-eye-fill", url: "/admin", title: t("menu.admin") },
];

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const save = async (data: ChannelRequest) => {
  try {
    saving.value = true;
    await channelStore.save(data);
    hideModal();
  } catch (e) {
    toastStore.error({
      title: "Save Error",
      message: e instanceof Error ? e.message : "An unknown error occurred.",
    });
  } finally {
    saving.value = false;
  }
};

const logout = () => {
  authStore.logout();
  window.location.assign("/login");
};

const hideModal = () => {
  const query = { ...route.query };
  delete query.channel;
  router.replace({ path: route.path, query });
};

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(
  () => route.query,
  (newQuery) => {
    showModal.value = "channel" in newQuery;
  },
);

watch(showModal, (val) => {
  if (val) {
    router.push({ query: { channel: "add" } });
  } else {
    hideModal();
  }
});

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    return;
  }

  setInterval(() => {
    toastStore[Math.random() > 0.5 ? 'warn' : 'info']({title: "Test", message: "adiopasjdoiasdjasiodj"});
  }, 1500)

  await jobStore.load();

  await socketManager.connect();

  socketManager.on(MessageType.JobStart, (message) => {
    const data = message as JobMessage<TaskInfo>;
    jobStore.start(data);
  });

  socketManager.on(MessageType.JobCreate, (data) => {
    const job = data as DatabaseJob;
    jobStore.add(job);
    toastStore.success({
      title: "Job created",
      message: `File ${job.filename} in ${job.channelName}`,
    });
  });

  // Dispatch
  socketManager.on(MessageType.JobDone, (message) => {
    jobStore.done(message as JobMessage<TaskComplete>);
  });

  // Dispatch
  socketManager.on(MessageType.JobDeactivate, (message) => {
    jobStore.done(message as JobMessage<TaskComplete>);
  });

  socketManager.on(MessageType.JobDelete, (jobId) => {
    const id = jobId as number;
    jobStore.destroy(id);
    toastStore.success({
      title: "Job destroyed",
      message: `Job id ${id} removed`,
    });
  });

  socketManager.on(MessageType.JobDeleted, (data) => jobStore.destroy(data as number));
  socketManager.on(MessageType.JobProgress, (data) => jobStore.progress(data as JobMessage<TaskProgress>));

  socketManager.on(MessageType.ChannelOnline, (data) => channelStore.online(data as number));
  socketManager.on(MessageType.ChannelOffline, (data) => channelStore.offline(data as number));
  socketManager.on(MessageType.ChannelThumbnail, (data) => channelStore.thumbnail(data as number));

  socketManager.on(MessageType.ChannelStart, (data) => {
    const id = data as number;
    channelStore.start(id);
    toastStore.info({ title: "Channel recording", message: `Channel id ${id}` });
  });
});

onUnmounted(() => {
  socketManager.close();
});
</script>
