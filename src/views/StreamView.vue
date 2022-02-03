<template>
  <div class="row">
    <template v-if="selectedFolder===''">
      <div>
        <input class="form-control mb-3" type="text" placeholder="search" v-model="searchVal">
      </div>
      <div v-for="channel in sortedChannels" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12 mb-3">
        <ChannelItem :channel="channel"/>
      </div>
    </template>
    <template v-else>
      <h4><span class="text-danger">{{ selectedFolder }}</span>'s videos</h4>
      <hr/>
      <div v-if="recordings.length === 0" class="d-flex justify-content-center">
        <h3 class="text-dark">
          No Videos
        </h3>
      </div>
      <div v-else v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-4 col-xl-3 col-xxl-2 col-md-12">
        <RecordingItem :recording="recording" @destroyed="destroyRecording"/>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
//import socket from "@/socket";
//import event from "@/services/event";
import { defineComponent } from 'vue';
import ChannelItem from '@/components/ChannelItem.vue';
import RecordingItem from '@/components/RecordingItem.vue';

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  searchVal: string;
  busy: boolean;
  recordings: RecordingResponse[];
  selectedFolder: string;
}

function boolToInt(bool: boolean): number {
  return bool ? 1 : 0;
}

const recordingApi = new RecordingApi();
const channelService = new ChannelApi();

export default defineComponent({
  name: 'Recording',
  components: { RecordingItem, ChannelItem },
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  props: {
    channel: String,
  },
  data(): RecordingData {
    return {
      searchVal: '',
      busy: false,
      recordings: [],
      selectedFolder: '',
    };
  },
  computed: {
    sortedChannels(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => {
            if (this.searchVal !== '') {
              return row.channelName.indexOf(this.searchVal) !== -1;
            }
            return true;
          })
          .sort((a, b) => a.channelName.localeCompare(b.channelName))
          .sort((a, b) => boolToInt(b.isOnline) - boolToInt(a.isOnline))
          .sort((a, b) => boolToInt(a.isPaused) - boolToInt(b.isPaused))
          .sort((a, b) => boolToInt(b.isRecording) - boolToInt(a.isRecording));
    },
  },
  watch: {
    $route() {
      this.recordings = [];
    },
    '$route.params.channel': {
      handler: function (channel) {
        // routes away
        if (channel !== '' && this.selectedFolder !== '') {
          return;
        }

        if (channel === '') {
          this.selectedFolder = '';
          this.$store.commit('clearChannels');
          this.$nextTick(() => {
            channelService.getChannels()
                .then(res => res.data.forEach(channel => this.$store.commit('addChannel', channel)))
                .catch(console.error);
          });
          return;
        }

        this.$nextTick(() => {
          this.selectedFolder = channel;
          recordingApi.getRecordings(channel).then(res => {
            this.recordings = res.data;
            this.busy = false;
            window.scrollTo(0, 0);
          }).catch(err => {
            this.busy = false;
            alert(err);
          });
        });
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    destroyRecording(recording: RecordingResponse) {
      for (let i = 0; i < this.recordings.length; i += 1) {
        if (this.recordings[i].filename === recording.filename) {
          this.recordings.splice(i, 1);
          break;
        }
      }
    }
  },
  beforeCreate() {
    //socket.on(event.channel.add, data => {
    //  this.channels.push(data.channel);
    //});
  }
});
</script>

<style scoped>

</style>
