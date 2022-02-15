<template>
  <div>
    <div class="row">
      <div class="d-flex">
        <input list="datalistOptions" class="form-control mb-3 bg-light border-info" type="text" placeholder="search" v-model="searchVal">
        <datalist id="datalistOptions">
          <option v-for="channel in $store.state.channels" :key="channel.channelName" :value="channel.channelName"/>
        </datalist>
        <select class="form-select mb-3 ms-3 bg-light border-info w-20" v-model="tagFilter">
          <option value=""></option>
          <option :key="tag" v-for="tag in tags" :value="tag">{{ tag }}</option>
        </select>
        <i v-if="favs" class="bi bi-star-fill text-warning fs-4 ms-2" @click="favs=false"></i>
        <i v-else class="bi bi-star text-warning fs-4 ms-2" @click="favs=true"></i>
      </div>
    </div>
    <div class="row">

      <div v-if="searchVal !== '' || favs" class="col">
        <div class="row">
          <div v-if="searchResults.length===0" class="justify-content-center d-flex">
            <h5 class="m-5">No results...</h5>
          </div>
          <div v-else v-for="channel in searchResults" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
            <ChannelItem :channel="channel"/>
          </div>
        </div>
      </div>

      <div v-else class="col">
        <ul class="nav nav-tabs border-primary" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': $route.params.tab === 'live'}" @click="$router.push('/streams/live/tab')" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
              <span class="d-none d-lg-inline">Live</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Rec</span>
              <span class="recording-number">{{ recordingStreams.length }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': $route.params.tab === 'offline'}" @click="$router.push('/streams/offline/tab')" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
              <span class="d-none d-lg-inline">Offline</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Offline</span><span class="recording-number">{{
                  notRecordingStreams.length
                }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': $route.params.tab === 'disabled'}" @click="$router.push('/streams/disabled/tab')" id="disabled-tab" data-bs-toggle="tab" data-bs-target="#disabled" type="button" role="tab" aria-controls="disabled" aria-selected="false">
              <span class="d-none d-lg-inline">Disabled</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Disabled</span><span class="recording-number">{{ disabledStreams.length }}</span>
            </span>
            </button>
          </li>
        </ul>

        <div class="tab-content py-2" id="myTabContent">
          <div class="tab-pane fade" :class="{'active show': $route.params.tab === 'live'}" id="home" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
              <div v-if="recordingStreams.length===0" class="justify-content-center d-flex">
                <h5 class="m-5">No active streams</h5>
              </div>
              <div v-else v-for="channel in recordingStreams" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
                <ChannelItem :channel="channel"/>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': $route.params.tab === 'offline'}" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <div class="row">
              <div v-if="notRecordingStreams.length===0" class="justify-content-center d-flex">
                <h5 class="m-5">Empty</h5>
              </div>
              <div v-else v-for="channel in notRecordingStreams" :key="channel.channelName" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
                <ChannelItem :channel="channel"/>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': $route.params.tab === 'disabled'}" id="disabled" role="tabpanel" aria-labelledby="disabled-tab">
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
  </div>
</template>

<script lang="ts">
//import socket from "@/socket";
//import event from "@/services/event";
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
import { defineComponent } from 'vue';
import ChannelItem from '@/components/ChannelItem.vue';

function filter(row: ChannelResponse, search: string, tag: string): boolean {
  return row.channelName.indexOf(search) !== -1 && row.tags.indexOf(tag) !== -1;
}

function sort(a: ChannelResponse, b: ChannelResponse) { return a.channelName.localeCompare(b.channelName); }

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  searchVal: string;
  thread: number;
  busy: boolean;
  tagFilter: string;
  favs: boolean;
}

const channelService = new ChannelApi();

export default defineComponent({
  name: 'Recording',
  components: { ChannelItem },
  inject: ['baseUrl', 'apiUrl', 'fileUrl', 'socketUrl'],
  props: {
    channel: String,
  },
  data(): RecordingData {
    return {
      favs: false,
      thread: 0,
      searchVal: '',
      busy: false,
      tagFilter: '',
    };
  },
  computed: {
    tags(): string[] {
      const unionTags: { [key: string]: boolean; } = {};
      this.$store.state.channels.map<string[]>(channel => channel.tags !== '' ? channel.tags.split(',') : [])
          .forEach(tags => tags.forEach(tag => unionTags[tag] = true));

      return Object.keys(unionTags);
    },
    search() {
      return this.searchVal.trim().toLowerCase();
    },
    notRecordingStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => !row.isRecording && !row.isPaused)
          .filter(row => filter(row, this.search, this.tagFilter))
          .filter(row => this.favs ? row.fav : true)
          .sort(sort);
    },
    disabledStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.isPaused)
          .filter(row => filter(row, this.search, this.tagFilter))
          .filter(row => this.favs ? row.fav : true)
          .sort(sort);
    },
    recordingStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.isRecording)
          .filter(row => filter(row, this.search, this.tagFilter))
          .filter(row => this.favs ? row.fav : true)
          .sort(sort);
    },
    favStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.fav)
          .filter(row => this.favs ? row.fav : true)
          .sort(sort);
    },
    searchResults(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => filter(row, this.search, this.tagFilter))
          .filter(row => this.favs ? row.fav : true)
          .sort(sort);
    },
  },
  methods: {},
  mounted() {
    channelService.getChannels()
        .then(res => res.data.forEach(channel => {
          this.$store.commit('addChannel', channel);
        }));
  },
  beforeRouteLeave() {
    clearInterval(this.thread);
  },
  created() {
    //@ts-ignore
    const c = new WebSocket(this.socketUrl);

    // const send = function (data: any) {
    //   c.send(JSON.stringify(data));
    // };

    c.onmessage = (msg: any) => {
      const data = JSON.parse(msg.data) as { tag: string, message: string };
      this.$store.commit(data.tag, data.message);
    };

    c.onopen = function () {
      console.log('open ws');
    };

    c.onerror = (ev: Event) => {
      console.error(ev);
    };
  }
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
