<template>
  <div class="card bg-light mb-3 border shadow-sm position-relative border-primary"
       :class="{'animate__animated animate__zoomOut': destroyed, 'opacity-50': channel.isPaused, 'border-primary': !channel.isRecording}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>

    <Preview class="card-img-top"
             @selected="viewFolder(channel.channelName)"
             :data="{channelName: channel}"
             :image="fileUrl +'/'+ channel.preview + (channel.previewUpdate ? '?' + String(channel.previewUpdate.getTime()) : '')"/>
    <div class="card-body">
      <div class="card-title p-1 m-0" :class="{'bg-primary' : !channel.isRecording && !channel.isOnline, 'bg-danger': channel.isRecording, 'bg-success': channel.isOnline && !channel.isRecording}">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank" :href="channel.url">
            {{ channel.displayName }}
            <i class="bi bi-link"/>
          </a>
        </h6>
      </div>
    </div>
    <StreamInfo :channel="channel" :fav="channel.fav" @edit="(data) => $emit('edit', data)" @fav="fav" @unfav="unfav" @pause="pause" @destroy="destroyChannel"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import StreamInfo from '@/components/StreamInfo.vue';
import Preview from '@/components/Preview.vue';
import { V1ChannelResponse } from '@/services/api/v1/StreamSinkClient';
import { createClient } from '@/services/api/v1/ClientFactory';

interface ChannelResponse extends V1ChannelResponse {
  previewUpdate: Date;
}

const api = createClient();

export default defineComponent({
  name: 'streamsink-channel-item',
  components: { StreamInfo, Preview },
  emits: ['edit'],
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  props: {
    channel: { type: Object as PropType<ChannelResponse>, required: true }
  },
  data() {
    return {
      destroyed: false,
      busy: false,
    };
  },
  methods: {
    async fav(channel: ChannelResponse) {
      await api.channels.favPartialUpdate(channel.channelName);
      this.$store.commit('fav', channel);
    },
    async unfav(channel: ChannelResponse) {
      await api.channels.unfavPartialUpdate(channel.channelName);
      this.$store.commit('unfav', channel);
    },
    async destroyChannel(channel: ChannelResponse) {
      if (window.confirm(this.$t('crud.destroy', [channel.channelName]))) {
        try {
          this.busy = true;
          await api.channels.channelsDelete(channel.channelName);
          this.destroyed = true;
          setTimeout(() => {
            this.$store.commit('destroyChannel', channel);
          }, 1000);
        } catch (ex) {
          alert(ex);
        } finally {
          this.busy = false;
        }
      }
    },
    async pause(channel: ChannelResponse) {
      try {
        this.busy = true;
        const method = channel.isPaused ? api.channels.resumeCreate : api.channels.pauseCreate;
        await method(channel.channelName);
        this.$store.commit('pauseChannel', { channel, pause: !channel.isPaused });
      } catch (err) {
        alert(err);
      } finally {
        this.busy = false;
      }
    },
    viewFolder(channel: string) {
      this.$router.push('/streams/' + channel);
    },
  }
});
</script>

<style scoped>
</style>
