<template>
  <div class="card bg-light mb-3 border shadow-sm position-relative"
       :class="{'animate__animated animate__zoomOut': destroyed, 'opacity-50': channel.isPaused, 'border-primary': !channel.isRecording, 'border-danger border-2': channel.isRecording}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>

    <Preview class="card-img-top"
             @selected="viewFolder(channel.channelName)"
             :data="{channelName: channel}"
             :image="baseUrl +'/'+ channel.preview"/>
    <div class="card-body">
      <div class="card-title p-1" :class="{'bg-primary' : !channel.isOnline, 'bg-success': channel.isOnline && !channel.isRecording, 'bg-danger': channel.isRecording}">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank" :href="channel.url">
            {{ channel.channelName }}
          </a>
        </h6>
      </div>
    </div>
    <StreamInfo :channel="channel" @pause="pause" @destroy="destroyChannel"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
import StreamInfo from '@/components/StreamInfo.vue';
import Preview from '@/components/Preview.vue';

const channelService = new ChannelApi();

export default defineComponent({
  name: 'ChannelItem',
  components: { StreamInfo, Preview },
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  props: {
    channel: Object
  },
  data() {
    return {
      destroyed: false,
      busy: false,
    };
  },
  methods: {
    destroyChannel(channel: ChannelResponse) {
      this.busy = true;
      if (window.confirm(`Do you want to remove the channel '${channel.channelName}'?`)) {
        channelService.destroy(channel.channelName)
            .then(() => {
              this.destroyed = true;
              setTimeout(() => {
                this.$store.commit('destroyChannel', channel);
                this.busy = false;
              }, 1000);
            })
            .catch(err => {
              alert(err);
              this.busy = false;
            });
      }
    },
    pause(channel: ChannelResponse) {
      this.busy = true;
      channelService[channel.isPaused ? 'resume' : 'pause'](channel.channelName)
          .then(() => {
            this.$store.commit('pauseChannel', { channel, pause: !channel.isPaused });
            this.busy = false;
          })
          .catch(err => {
            alert(err);
            this.busy = false;
          });
    },
    viewFolder(channel: string) {
      this.$router.push('/streams/' + channel);
    },
  }
});
</script>

<style scoped>

</style>
