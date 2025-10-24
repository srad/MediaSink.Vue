<template>
  <div class="h-100">
    <NavTop :routes="routes" :title="title" @add="showModal = true" :show-logout="true" @logout="logout" />
    <main class="container-fluid" style="margin-top: 4rem">
      <slot></slot>
      <ChannelModal :clear="showModal" :show="showModal" :is-paused="false" :saving="false" title="Stream Data" @save="save" @close="showModal = false" />
      <AppToaster :toasts="toastStore.all" @destroy="(toast) => toastStore.destroy(toast)" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { type DatabaseJob, type RequestsChannelRequest as ChannelRequest } from "@/services/api/v1/MediaSinkClient";
import { MessageType } from "@/utils/socket";
import { useSocket } from "@/composables/useSocket";
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
import { handlePotentialServerError } from "@/utils/serverError";

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

const { socket: socketManager, connect } = useSocket();

const routes = [
  { icon: "bi-camera-video-fill", url: "/streams/live", title: t("menu.streams") },
  { icon: "bi-list", url: "/channels", title: t("menu.channels") },
  { icon: "bi-stopwatch", url: "/filter", title: t("menu.latest") },
  { icon: "bi-hypnotize", url: "/random", title: t("menu.random") },
  { icon: "bi-heart-fill", url: "/bookmarks", title: t("menu.favs") },
];

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const save = async (data: ChannelRequest) => {
  try {
    saving.value = true;
    await channelStore.create(data);
    hideModal();
  } catch (e: unknown) {
    const err = (e as { error?: string }).error;
    alert(err);
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
    router.push({ query: { channel: "add", ...route.query } });
  } else {
    hideModal();
  }
});

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// Socket Event Handlers (defined outside onMounted to prevent duplicate registrations)
// --------------------------------------------------------------------------------------

const handleJobStart = (message: unknown) => {
  const data = message as JobMessage<TaskInfo>;
  jobStore.start(data);
};

const handleJobCreate = (data: unknown) => {
  const job = data as DatabaseJob;
  jobStore.add(job);
  toastStore.success({
    title: "Job created",
    message: `File ${(job as DatabaseJob).filename} in ${(job as DatabaseJob).channelName}`,
  });
};

const handleJobDone = (message: unknown) => {
  jobStore.done(message as JobMessage<TaskComplete>);
};

const handleJobDeactivate = (message: unknown) => {
  jobStore.done(message as JobMessage<TaskComplete>);
};

const handleJobDelete = (jobId: unknown) => {
  const id = jobId as number;
  jobStore.destroy(id);
  toastStore.success({
    title: "Job destroyed",
    message: `Job id ${id} removed`,
  });
};

const handleJobDeleted = (data: unknown) => jobStore.destroy(data as number);
const handleJobProgress = (data: unknown) => jobStore.progress(data as JobMessage<TaskProgress>);
const handleChannelOnline = (data: unknown) => channelStore.online(data as number);
const handleChannelOffline = (data: unknown) => channelStore.offline(data as number);
const handleChannelThumbnail = (data: unknown) => channelStore.thumbnail(data as number);

const handleChannelStart = (data: unknown) => {
  const id = data as number;
  channelStore.start(id);
  toastStore.info({ title: "Channel recording", message: `Channel id ${id}` });
};

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    return;
  }

  try {
    // Try to load initial job data
    await jobStore.load();
  } catch (error) {
    // Check if this is a server unreachability error and handle it
    console.error("[DefaultLayout] Job load error:", error);
    const wasServerError = await handlePotentialServerError(error);
    if (wasServerError) {
      console.log("[DefaultLayout] Server unreachable error handled, redirecting to login");
      return; // User has been logged out and redirected
    }
    // Log other errors but continue
    console.error("[DefaultLayout] Non-server error, continuing anyway:", error);
  }

  try {
    // Try to connect to socket
    await socketManager.connect();
  } catch (error) {
    // Check if this is a server unreachability error and handle it
    console.error("[DefaultLayout] Socket connect error:", error);
    const wasServerError = await handlePotentialServerError(error);
    if (wasServerError) {
      console.log("[DefaultLayout] Server unreachable error handled, redirecting to login");
      return; // User has been logged out and redirected
    }
    // Log other errors but continue (socket will attempt to reconnect)
    console.error("[DefaultLayout] Non-server socket error, continuing anyway:", error);
  }

  // Unregister previous listeners to prevent duplicates on reconnection
  socketManager.off(MessageType.JobStart, handleJobStart);
  socketManager.off(MessageType.JobCreate, handleJobCreate);
  socketManager.off(MessageType.JobDone, handleJobDone);
  socketManager.off(MessageType.JobDeactivate, handleJobDeactivate);
  socketManager.off(MessageType.JobDelete, handleJobDelete);
  socketManager.off(MessageType.JobDeleted, handleJobDeleted);
  socketManager.off(MessageType.JobProgress, handleJobProgress);
  socketManager.off(MessageType.ChannelOnline, handleChannelOnline);
  socketManager.off(MessageType.ChannelOffline, handleChannelOffline);
  socketManager.off(MessageType.ChannelThumbnail, handleChannelThumbnail);
  socketManager.off(MessageType.ChannelStart, handleChannelStart);

  // Register listeners
  socketManager.on(MessageType.JobStart, handleJobStart);
  socketManager.on(MessageType.JobCreate, handleJobCreate);
  socketManager.on(MessageType.JobDone, handleJobDone);
  socketManager.on(MessageType.JobDeactivate, handleJobDeactivate);
  socketManager.on(MessageType.JobDelete, handleJobDelete);
  socketManager.on(MessageType.JobDeleted, handleJobDeleted);
  socketManager.on(MessageType.JobProgress, handleJobProgress);
  socketManager.on(MessageType.ChannelOnline, handleChannelOnline);
  socketManager.on(MessageType.ChannelOffline, handleChannelOffline);
  socketManager.on(MessageType.ChannelThumbnail, handleChannelThumbnail);
  socketManager.on(MessageType.ChannelStart, handleChannelStart);
});

onUnmounted(() => {
  socketManager.close();
});
</script>
