<template>
  <div class="row">
    <template v-if="selectedFolder===''">
      <div v-for="(channel, i) in sortedChannels" :key="i" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
        <div class="card bg-light mb-3 border-primary border shadow-sm" :class="{'opacity-50': channel.isPaused}">
          <Preview class="card-img-top" @selected="viewFolder(channel.channelName)" :data="channel"
                   :place-holder-image="placeHolderImage" :image="baseUrl +'/'+ channel.preview.replaceAll('\\', '/')"/>
          <div class="card-body">
            <div class="card-title p-1" :class="{'bg-primary' : !channel.isOnline, 'bg-success': channel.isOnline}">
              <h6 class="p-2 m-0 text-white">
                <a class="text-white" target="_blank" :href="channel.url">
                  {{ channel.channelName }}
                </a>
              </h6>
            </div>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between">
              <div>
                <span class="badge me-2" :class="{'bg-danger text-white border border-danger': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
                <span class="badge" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
              </div>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span v-if="channel.isRecording">Recorded: {{ channel.minRecording.toFixed(1) }}min</span>
              <span v-else>&nbsp;</span>
              <div>Videos: {{ channel.RecordingsCount }}</div>
            </li>
            <li class="list-group-item bg-light d-flex justify-content-between">
              <span>
                <div class="form-check form-switch">
                  <input @click="pause(channel, i)" class="form-check-input" type="checkbox" :checked="!channel.isPaused" id="flexSwitchCheckDefault">
                  <label class="form-check-label" for="flexSwitchCheckDefault">Record</label>
                </div>
              </span>
              <button class="btn btn-sm btn-danger float-end" @click="destroyChannel(channel)">Delete</button>
            </li>
          </ul>
        </div>
      </div>
    </template>
    <template v-else>
      <h4><span class="text-danger">{{ selectedFolder }}</span>'s videos</h4>
      <hr/>
      <div v-if="recordings.length === 0" class="d-flex justify-content-center">
        <h3 class="text-dark">
          No Videos yet.
        </h3>
      </div>
      <div v-else v-for="(recording, i) in recordings" :key="i" class="col-lg-4 col-xl-3 col-xxl-2 col-md-12">
        <div class="card bg-light mb-3 border-primary border shadow-sm bg-light">
          <Preview class="card-img-top" :data="recording" :place-holder-image="placeHolderImage"
                   @selected="load" :preview-video="baseUrl + '/' + recording.previewVideo.replaceAll('\\', '/')"/>
          <RecordInfo
              :url="apiUrl + '/recordings/' + recording.channelName + '/' + recording.filename"
              :index="i"
              :duration="recording.duration"
              :size="recording.size"
              :bit-rate="recording.bitRate"
              :bookmark="recording.bookmark"
              :created-at="recording.createdAt"
              :data="recording"
              :width="recording.width"
              :height="recording.height"
              @bookmarked="bookmark"
              @preview="generatePreview"
              @destroy="destroyRecording"/>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
//import socket from "@/socket";
//import event from "@/services/event";
import Preview from '@/components/Preview.vue';
import { defineComponent } from 'vue';
import RecordInfo from '@/components/RecordInfo.vue';

interface RecordingData {
  placeHolderImage: string;
  apiUrl?: string;
  baseUrl?: string;
  busy: boolean;
  recordings: RecordingResponse[];
  channels: ChannelResponse[];
  selectedFolder: string;
}

function boolToInt(bool: boolean): number {
  return bool ? 1 : 0;
}

const recordingApi = new RecordingApi();
const channelApi = new ChannelApi();

export default defineComponent({
  name: 'Recording',
  components: { Preview, RecordInfo },
  emits: ['load'],
  inject: ['baseUrl', 'apiUrl'],
  props: {
    channel: String,
  },
  data(): RecordingData {
    return {
      placeHolderImage: 'https://via.placeholder.com/150x100?text=No+Preview', //process.env.VUE_APP_BASE + "/public/preview-placeholder.png",
      busy: false,
      recordings: [],
      channels: [],
      selectedFolder: '',
    };
  },
  computed: {
    sortedChannels(): ChannelResponse[] {
      return this.channels.slice()
          .sort((a, b) => a.channelName.localeCompare(b.channelName))
          .sort((a, b) => boolToInt(b.isOnline) - boolToInt(a.isOnline))
          .sort((a, b) => boolToInt(a.isPaused) - boolToInt(b.isPaused))
          .sort((a, b) => boolToInt(b.isRecording) - boolToInt(a.isRecording));
    },
  },
  watch: {
    $route() {
      this.channels = [];
      this.recordings = [];
    },
    '$route.params.channel': {
      handler: function (channel) {
        if (typeof channel === 'undefined') {
          return;
        }

        if (channel !== '') {
          this.selectedFolder = channel;
          if (!channel || channel === '') {
            this.recordings = [];
            return;
          }
          this.$nextTick(() => {
            recordingApi.getRecordings(this.selectedFolder || this.channel).then(res => {
              this.recordings = res.data;
              this.busy = false;
              window.scrollTo(0, 0);
            }).catch(err => {
              this.busy = false;
              alert(err);
            });
          });
        } else {
          this.selectedFolder = '';
          this.channels = [];
          this.$nextTick(() => {
            channelApi.getChannels().then(res => {
              this.channels = res.data;
            }).catch(console.error);
          });
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    destroyChannel(channel: ChannelResponse) {
      if (window.confirm(`Do you want to remove the channel '${channel.channelName}'?`)) {
        channelApi.destroy(channel.channelName).catch(() => {
          for (let i = 0; i < this.channels.length; i += 1) {
            if (this.channels[i].channelName === channel.channelName) {
              this.channels.splice(i, 1);
              break;
            }
          }
        }).catch(err => alert(err));
      }
    },
    pause(channel: ChannelResponse) {
      channelApi[channel.isPaused ? 'resume' : 'pause'](channel.channelName).then(() => {
        for (let i = 0; i < this.channels.length; i++) {
          if (this.channels[i].channelName === channel.channelName) {
            this.channels[i].isPaused = !this.channels[i].isPaused;
            break;
          }
        }
      }).catch(err => {
        alert(err);
      });
    },
    bookmark(recording: RecordingResponse, yesNo: boolean) {
      recordingApi.bookmark(recording.channelName, recording.filename, yesNo)
          .then(() => {
            for (let i = 0; i < this.recordings.length; i++) {
              if (this.recordings[i].filename === recording.filename) {
                this.recordings[i].bookmark = yesNo;
                break;
              }
            }
          })
          .catch(err => {
            alert(err);
          });
    },
    generatePreview(recording: RecordingResponse) {
      if (window.confirm('Generate new preview?')) {
        recordingApi.generatePreview(recording.channelName, recording.filename)
            .catch(err => alert(err.data));
      }
    },
    load(recording: RecordingResponse) {
      this.$router.push({
        name: 'Video',
        //@ts-ignore
        params: recording
      });
    },
    viewFolder(channel: string) {
      this.$router.push('/streams/' + channel);
    },
    destroyRecording(recording: RecordingResponse) {
      if (!window.confirm(`Delete '${recording.filename}'?`)) {
        return;
      }

      this.busy = true;
      recordingApi.destroy(recording.channelName, recording.filename).then(() => {
        for (let i = 0; i < this.recordings.length; i += 1) {
          if (this.recordings[i].filename === recording.filename) {
            this.recordings.splice(i, 1);
            break;
          }
        }
        // Let the ui update
        this.busy = false;
      }).catch(err => {
        this.busy = false;
        console.error(err);
        alert(err);
      });
    },
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
