<template>
  <div>
    <ChannelModal
        @save="save"
        @close="showModal=false"
        title="Edit Stream"
        :is-paused="isPaused"
        :channel-disabled="true"
        :clear="false"
        :channel-id="channelId"
        :show="showModal"
        :channel-name="channelName"
        :display-name="displayName"
        :url="url"
        :skip-start="skipStart"/>

    <div class="row">
      <div class="col">
        <div class="d-flex rounded-2 border mb-3 p-0 bg-light border-info p-1">
          <input autocapitalize="off" class="w-100 p-2 border-0 bg-transparent" type="text" placeholder="search ... #tag" v-model="searchVal">
          <!--
          <select class="form-select mb-3 ms-3 bg-light border-info w-20" v-model="tagFilter">
            <option value=""></option>
            <option :key="tag" v-for="tag in tags" :value="tag">{{ tag }}</option>
          </select>
          -->
          <i v-if="favs" class="px-2 bi bi-star-fill text-warning fs-4 ms-2" @click="favs=false"></i>
          <i v-else class="px-2 bi bi-star text-warning fs-4 ms-2" @click="favs=true"></i>
        </div>
      </div>
    </div>
    <div class="row">

      <div v-if="searchVal !== '' || favs" class="col">
        <div class="row">
          <div v-if="searchResults.length===0" class="justify-content-center d-flex">
            <h5 class="m-5">No results...</h5>
          </div>
          <div v-else v-for="channel in searchResults" :key="channel.channelName" :class="channelItemClass">
            <ChannelItem :channel="channel"/>
          </div>
        </div>
      </div>

      <div v-else class="col">
        <ul class="nav nav-tabs border-primary" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': $route.params.tab === 'live'}" @click="tab('live')" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
              <span class="d-none d-lg-inline">Live</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Rec</span>
              <span class="recording-number">{{ recordingStreams.length }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': $route.params.tab === 'offline'}" @click="tab('offline')" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
              <span class="d-none d-lg-inline">Offline</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Offline</span><span class="recording-number">{{
                  notRecordingStreams.length
                }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': $route.params.tab === 'disabled'}" @click="tab('disabled')" id="disabled-tab" data-bs-toggle="tab" data-bs-target="#disabled" type="button" role="tab" aria-controls="disabled" aria-selected="false">
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
              <div v-else v-for="channel in recordingStreams" :key="channel.channelName" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': $route.params.tab === 'offline'}" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <div class="row">
              <div v-if="notRecordingStreams.length===0" class="justify-content-center d-flex">
                <h5 class="m-5">Empty</h5>
              </div>
              <div v-else v-for="channel in notRecordingStreams" :key="channel.channelName" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': $route.params.tab === 'disabled'}" id="disabled" role="tabpanel" aria-labelledby="disabled-tab">
            <div class="row">
              <div v-if="disabledStreams.length===0" class="justify-content-center d-flex">
                <h5 class="m-5">Empty</h5>
              </div>
              <div v-else v-for="channel in disabledStreams" :key="channel.channelName" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import socket from '@/utils/socket';
import { ChannelApi, ChannelRequest, ChannelResponse } from '@/services/api/v1/channelApi';
import { defineComponent } from 'vue';
import ChannelItem from '@/components/ChannelItem.vue';
import ChannelModal from '@/components/modals/ChannelModal.vue';
import { AxiosError, AxiosResponse } from 'axios';

function filter(row: ChannelResponse, search: string, tag: string): boolean {
  return row.channelName.indexOf(search) !== -1 && row.tags.indexOf(tag) !== -1;
}

function sort(a: ChannelResponse, b: ChannelResponse) { return a.channelName.localeCompare(b.channelName); }

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  searchVal: string;
  busy: boolean;
  tagFilter: string;
  favs: boolean;
  showModal: boolean;

  channelId: number;
  isPaused: boolean;
  channelName: string;
  displayName: string;
  skipStart: number;
  url: string;

  channelItemClass: string;
}

const channelService = new ChannelApi();

export default defineComponent({
  name: 'Recording',
  components: { ChannelItem, ChannelModal },
  inject: ['baseUrl', 'apiUrl', 'fileUrl', 'socketUrl'],
  props: {
    channel: String,
  },
  data(): RecordingData {
    return {
      channelItemClass: 'col-lg-5 col-xl-4 col-xxl-4 col-md-10',
      channelId: 0,
      showModal: false,
      channelName: '',
      displayName: '',
      isPaused: false,
      url: '',
      skipStart: 0,
      favs: false,
      //@ts-ignore
      searchVal: this.$route.query.search || this.$route.query.tag || this.$route.params.tag || '',
      busy: false,
      //@ts-ignore
      tagFilter: this.$route.params.tag || this.$route.query.tag || '',
    };
  },
  watch: {
    searchVal(search) {
      this.$router.replace({ query: { search } });
    },
    '$route.query'(params) {
      if (params.tag && params.tag !== '') {
        this.searchVal = `#${params.tag}`;
      } else {
        this.searchVal = params.search || '';
      }
    },
    tagFilter(val) {
      this.$router.replace({ params: { tag: val } });
    }
  },
  computed: {
    tags(): string[] {
      const unionTags: { [key: string]: boolean; } = {};
      this.$store.state.channels.map<string[]>(channel => channel.tags !== '' ? channel.tags.split(',') : [])
          .forEach(tags => tags.forEach(tag => unionTags[tag] = true));

      return Object.keys(unionTags);
    },
    search(): string {
      return this.searchVal.trim().toLowerCase();
    },
    searchTerms(): string {
      return this.search.split(' ').filter(s => s[0] !== '#').join(' ');
    },
    tagTerms(): string {
      return this.search.split(' ').filter(s => s[0] === '#').map(s => s.slice(1, s.length)).join(' ');
    },
    notRecordingStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => !row.isRecording && !row.isPaused)
          .sort(sort);
    },
    disabledStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.isPaused)
          .sort(sort);
    },
    recordingStreams(): ChannelResponse[] {
      return this.$store.state.channels.slice()
          .filter(row => row.isRecording)
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
          .filter(row => filter(row, this.searchTerms, this.tagTerms))
          .filter(row => this.favs ? row.fav : true)
          .sort(sort);
    },
  },
  methods: {
    save(data: ChannelRequest) {
      channelService.update(data)
          .then((res: AxiosResponse<ChannelResponse>) => {
            this.showModal = false;
            this.$store.commit('updateChannel', res.data);
            this.showModal = false;
          })
          .catch((err: AxiosError) => {
            alert(err.response?.data);
            this.showModal = false;
          });
    },
    editChannel(channel: ChannelRequest) {
      this.channelId = channel.channelId!;
      this.channelName = channel.channelName;
      this.displayName = channel.displayName;
      this.isPaused = channel.isPaused;
      this.url = channel.url;
      this.skipStart = channel.skipStart;
      this.showModal = true;
    },
    tab(tab: string) {
      this.$router.push({ name: 'Stream', params: { tag: this.tagFilter, tab } });
    }
  },
  mounted() {
    channelService.getChannels()
        .then(res => res.data.forEach(channel => {
          this.$store.commit('addChannel', channel);
        }));
  },
  created() {
    socket.on('channel:online', data => this.$store.commit('channel:online', data));
    socket.on('channel:offline', data => this.$store.commit('channel:offline', data));
    socket.on('channel:thumbnail', data => this.$store.commit('channel:thumbnail', data));
    socket.on('channel:start', data => this.$store.commit('channel:start', data));
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
