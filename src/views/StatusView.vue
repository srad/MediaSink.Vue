<template>
  <Statuses class="shadow-sm border-secondary border"
            :statuses="sortedChannels"
            :recording="recording"
            :place-holder-image="placeHolderImage"
            @select="showRecordings"
            @pause="pauseChannel"
            @destroy="destroyChannel"
            @resume="resumeChannel"
            @write="writeStream"/>
</template>

<script lang="ts">
import Statuses from '@/components/Statuses.vue';
import { RecordingResponse } from '@/services/api/v1/recordingApi';
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
//import socket from "@/socket";
//import event from "@/services/event";
import { defineComponent } from 'vue';

interface StatusData {
  placeHolderImage: string;
  busy: boolean;
  channels: ChannelResponse[];
  baseUrl: string;
}

const channelApi = new ChannelApi();

function boolToInt(bool: boolean): number {
  return bool ? 1 : 0;
}

export default defineComponent({
  name: 'StatusView',
  components: { Statuses },
  computed: {
    sortedChannels(): ChannelResponse[] {
      return this.channels.slice()
          .sort((a, b) => a.channelName.localeCompare(b.channelName))
          .sort((a, b) => boolToInt(b.isOnline) - boolToInt(a.isOnline))
          .sort((a, b) => boolToInt(a.isPaused) - boolToInt(b.isPaused))
          .sort((a, b) => boolToInt(b.isRecording) - boolToInt(a.isRecording));
    },
  },
  props: {
    recording: Boolean
  },
  data(): StatusData {
    return {
      placeHolderImage: 'https://via.placeholder.com/150x100?text=No+Preview', //process.env.VUE_APP_BASE + "/public/preview-placeholder.png",
      busy: false,
      channels: [],
      baseUrl: process.env.VUE_APP_BASE,
    };
  },
  methods: {
    showRecordings(recording: RecordingResponse) {
      this.$router.push({
        name: 'Recording',
        params: { channel: recording.channelName }
      });
    },
    pauseChannel(channel: ChannelResponse) {
      if (!window.confirm(`Stop stream '${channel.channelName}'?\nThe current recording will be written to disk.`)) {
        return;
      }

      this.busy = true;
      channelApi.pause(channel.channelName).then(() => {
        for (let i = 0; i < this.channels.length; i += 1) {
          if (this.channels[i].channelName === channel.channelName) {
            const item = this.channels.slice(i, i + 1)[0];
            item.isPaused = true;
            this.channels.splice(i, 1, item);
            break;
          }
        }
        this.busy = false;
      }).catch(err => {
        alert(err);
        this.busy = false;
      });
    },
    writeStream(status: ChannelResponse) {
      this.busy = false;
      channelApi.write(status.channelName).then(() => {
        this.busy = false;
      }).catch((err: any) => {
        alert(err);
        this.busy = false;
      });
    },
    resumeChannel(channel: ChannelResponse) {
      if (!window.confirm(`Resume recording '${channel.channelName}'?`)) {
        return;
      }

      this.busy = false;
      channelApi.resume(channel.channelName).then(() => {
        for (let i = 0; i < this.channels.length; i += 1) {
          if (this.channels[i].channelName === channel.channelName) {
            const item = this.channels.splice(i, 1)[0];
            item.isPaused = false;
            this.channels.splice(i, 1, item);
            break;
          }
        }
        this.busy = false;
      }).catch(err => {
        alert(err);
        this.busy = false;
      });
    },
    destroyChannel(status: ChannelResponse) {
      if (window.confirm(`Do you want to remove the channel '${status.channelName}'?`)) {
        channelApi.destroy(status.channelName).catch(() => {
          for (let i = 0; i < this.channels.length; i += 1) {
            if (this.channels[i].channelName === status.channelName) {
              this.channels.splice(i, 1);
              break;
            }
          }
        }).catch(err => alert(err));
      }
    },
  },
  created() {
    channelApi.getChannels().then(res => this.channels = res.data);

    // socket.on(event.channel.status, data => {
    //   for (let i = 0; i < this.channels.length; i += 1) {
    //     if (this.channels[i].channelName === data.channelName) {
    //       const item = this.channels.slice(i, i + 1)[0];
    //       item.isOnline = data.isOnline;
    //       this.channels.splice(i, 1, item);
    //       break;
    //     }
    //   }
    // });
    //
    // socket.on(event.channel.add, data => {
    //   this.channels.push(data);
    // });
  }
});
</script>

<style scoped>

</style>
