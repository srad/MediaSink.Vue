<template>
  <div class="row">
    <div class="col">
      <input class="form-control mb-3 bg-light border-info" type="text" placeholder="search" v-model="searchVal">

      <ul class="nav nav-tabs border-primary" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active d-flex justify-content-between" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
            <span class="d-none d-lg-inline">Recording</span>
            <span class="d-flex justify-content-between">
              <span class="d-lg-none">Rec</span>
              <span class="recording-number">{{ recordingStreams.length }}</span>
            </span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link d-flex justify-content-between" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
            <span class="d-none d-lg-inline">Offline</span>
            <span class="d-flex justify-content-between">
              <span class="d-lg-none">Offline</span><span class="recording-number">{{ notRecordingStreams.length }}</span>
            </span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link d-flex justify-content-between" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">
            <span class="d-none d-lg-inline">Disabled</span>
            <span class="d-flex justify-content-between">
              <span class="d-lg-none">Disabled</span><span class="recording-number">{{ disabledStreams.length }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div class="tab-content py-2" id="myTabContent">
        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
          <div class="row">
            <div v-if="recordingStreams.length===0" class="justify-content-center d-flex">
              <h5 class="m-5">No active streams</h5>
            </div>
            <div v-else v-for="channel in recordingStreams" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
              <ChannelItem :channel="channel"/>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
          <div class="row">
            <div v-if="notRecordingStreams.length===0" class="justify-content-center d-flex">
              <h5 class="m-5">Empty</h5>
            </div>
            <div v-else v-for="channel in notRecordingStreams" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
              <ChannelItem :channel="channel"/>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
          <div class="row">
            <div v-if="disabledStreams.length===0" class="justify-content-center d-flex">
              <h5 class="m-5">Empty</h5>
            </div>
            <div v-else v-for="channel in disabledStreams" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
              <ChannelItem :channel="channel"/>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
//import socket from "@/socket";
//import event from "@/services/event";
import { defineComponent } from 'vue';
import ChannelItem from '@/components/ChannelItem.vue';

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  searchVal: string;
  busy: boolean;
}

const channelService = new ChannelApi();

export default defineComponent({
  name: 'Recording',
  components: { ChannelItem },
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  props: {
    channel: String,
  },
  data(): RecordingData {
    return {
      searchVal: '',
      busy: false,
    };
  },
  computed: {
    notRecordingStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => !row.isRecording && !row.isPaused)
          .filter(row => {
            if (this.searchVal !== '') {
              return row.channelName.indexOf(this.searchVal) !== -1;
            }
            return true;
          });
    },
    disabledStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.isPaused)
          .filter(row => {
            if (this.searchVal !== '') {
              return row.channelName.indexOf(this.searchVal) !== -1;
            }
            return true;
          });
    },
    recordingStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.isRecording)
          .filter(row => {
            if (this.searchVal !== '') {
              return row.channelName.indexOf(this.searchVal) !== -1;
            }
            return true;
          });
    },
  },
  methods: {},
  created() {
    this.$store.commit('clearChannels');
    channelService.getChannels()
        .then(res => res.data.forEach(channel => this.$store.commit('addChannel', channel)))
        .catch(console.error);
  },
  //beforeCreate() {
  //socket.on(event.channel.add, data => {
  //  this.channels.push(data.channel);
  //});
  //}
});
</script>

<style lang="scss" scoped>
.nav-item .active {
  background-color: #4b4e6d;
  color: white;
  border: 1px solid #4b4e6d;
}

.recording-number {
  font-size: 0.8em;
}
</style>
