<template>
  <nav class="navbar navbar-dark navbar-expand-lg fixed-top m-0 d-flex bg-primary">
    <div class="container-fluid">
      <AppBrand class="mr-auto" :title="title"/>

      <span class="text-danger fw-bold">
                <i v-if="heartBeatNextUpdate>=0" class="bi blink bi-heart-pulse-fill"></i>
                <i v-else class="bi bi-heart-pulse"></i>
      </span>

      <div class="offcanvas offcanvas-end bg-dark" :class="{'show': showNav}" data-bs-backdrop="static" tabindex="-1" aria-labelledby="collapsibleNavbarLabel" id="collapsibleNavbar">
        <div class="offcanvas-header bg-primary text-white">
          <AppBrand class="mr-auto" :title="title"/>
          <button type="button" class="btn-close btn-close-white" @click="showNav = !showNav"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1">
            <li class="nav-item" v-for="link in props.routes" :key="link.url">
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
              <RecordingControls :jobs="jobs" :recording="recording" @add="emit('add')" @record="record"/>
            </li>
          </ul>
        </div>
      </div>

      <div class="d-lg-none">
        <RecordingControls :jobs="jobs" :recording="recording" @add="emit('add')" @record="record"/>
      </div>

      <button class="navbar-toggler d-l-none" type="button" @click="showNav = !showNav">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { defineProps, watch, defineEmits, computed, ref, reactive, onBeforeMount } from 'vue';
import { createClient } from '../../services/api/v1/ClientFactory';
import DiskStatus from '../DiskStatus.vue';
import RecordingControls from '../RecordingControls.vue';
import AppBrand from '../AppBrand.vue';
import { useRoute } from 'vue-router';
import { useStore } from '../../store';
import { MessageType, socket } from '../../utils/socket.ts';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  routes: { icon: string, url: string, title: string }[]
  title: string
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{ (e: 'add'): void }>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const api = createClient();

const diskInfo = reactive({ avail: '', pcent: '', size: '', used: '' });
const collapseNav = ref(true);
const recording = ref(false);
const heartBeatNextUpdate = ref<number>(-1);
const route = useRoute();
const store = useStore();
const showNav = ref(false);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(route, () => collapseNav.value = true);

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const jobs = computed(() => store.getters.openJobs);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const query = async () => {
  recording.value = await api.isRecording();

  const diskRes = await api.info.diskList();
  diskInfo.avail = diskRes.data.availFormattedGb!;
  diskInfo.pcent = diskRes.data.pcent!;
  diskInfo.size = diskRes.data.sizeFormattedGb!;
  diskInfo.used = diskRes.data.usedFormattedGb!;
};

const record = async (resume: boolean) => {
  try {
    if (resume) {
      if (window.confirm('Start recording?')) {
        await api.recorder.resumeCreate();
        recording.value = true;
      }
    } else {
      if (window.confirm('Do you want to stop all recordings?')) {
        await api.recorder.pauseCreate();
        store.commit('stopChannels');
        recording.value = false;
      }
    }
  } catch (e) {
    alert(e);
  }
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onBeforeMount(async () => {
  await query();
  setInterval(async () => await query(), 10 * 1000);
  socket.on(MessageType.HeartBeat, nextUpdate => {
    heartBeatNextUpdate.value = nextUpdate as number;
    const id = setInterval(() => {
      heartBeatNextUpdate.value -= 1;
      if (heartBeatNextUpdate.value <= 0) {
        clearInterval(id);
      }
    }, 1000);
  });
});
</script>
