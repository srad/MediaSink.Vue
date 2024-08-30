<template>
  <div class="card bg-light mb-3 border shadow-sm position-relative border-primary" :class="{'animate__animated animate__zoomOut': destroyed, 'opacity-50': props.channel.isPaused, 'border-primary': !props.channel.isRecording}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>

    <Preview class="card-img-top"
             @selected="viewFolder(props.channel.channelId!, props.channel.channelName)"
             :data="props.channel.channelId!"
             :previewImage="previewImage"/>
    <div class="card-body">
      <div class="card-title p-1 m-0" :class="{'bg-primary' : !props.channel.isRecording && !props.channel.isOnline, 'bg-danger': props.channel.isRecording, 'bg-success': props.channel.isOnline && !props.channel.isRecording}">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank" :href="props.channel.url">
            {{ props.channel.displayName }}
            <i class="bi bi-link"/>
          </a>
        </h6>
      </div>
    </div>
    <StreamInfo :channel="props.channel" :fav="props.channel.fav" @edit="data => emit('edit', data)" @fav="fav" @unfav="unfav" @pause="pause" @destroy="destroyChannel"/>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, defineProps, inject, computed } from 'vue';
import StreamInfo from './StreamInfo.vue';
import Preview from './Preview.vue';
import { V1ChannelResponse as ChannelResponse } from '../services/api/v1/StreamSinkClient';
import { createClient } from '../services/api/v1/ClientFactory';
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router'
import { useStore } from "../store";

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{ (e: 'edit', value: ChannelResponse): void }>();

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{ channel: ChannelResponse }>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const { t } = useI18n();

const router = useRouter()
const store = useStore();
const api = createClient();

const fileUrl = inject('fileUrl');

const destroyed = ref(false);
const busy = ref(false);

const previewImage = computed(() => fileUrl + '/' + props.channel.preview + '?' + Date.now());
const previewVideo = computed(() => fileUrl + '/' + props.channel.preview + '?' + Date.now()); //TODO: fix url

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const fav = async (channel: ChannelResponse) => {
  await api.channels.favPartialUpdate(channel.channelId!);
  store.commit('fav', channel.channelId);
};

const unfav = async (channel: ChannelResponse) => {
  await api.channels.unfavPartialUpdate(channel.channelId!);
  store.commit('unfav', channel.channelId);
};

const destroyChannel = async (channel: ChannelResponse) => {
  if (window.confirm(t('crud.destroy', [ channel.channelName ]))) {
    try {
      busy.value = true;
      await api.channels.channelsDelete(channel.channelId!);
      destroyed.value = true;
      setTimeout(() => {
        store.commit('destroyChannel', channel.channelId);
      }, 1000);
    } catch (ex) {
      alert(ex);
    } finally {
      busy.value = false;
    }
  }
};

const pause = async (channel: ChannelResponse) => {
  try {
    busy.value = true;
    const method = channel.isPaused ? api.channels.resumeCreate : api.channels.pauseCreate;
    await method(channel.channelId!);
    store.commit('channel:pause', { id: channel.channelId, pause: !channel.isPaused });
  } catch (err) {
    console.log(err);
  } finally {
    busy.value = false;
  }
};

const viewFolder = (id: number, name: string) => router.push(`/stream/${id}/${name}`);
</script>