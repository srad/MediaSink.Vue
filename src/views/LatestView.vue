<template>
  <div>
    <div class="row" v-if="$route.params.type==='random'">
      <div class="col">
        <button class="btn btn-primary" @click="fetch">
          Refresh
        </button>
        <hr/>
      </div>
    </div>
  </div>
  <div class="row">
    <div v-for="(recording, i) in recordings" :key="i" class="col-lg-4 col-xl-2 col-md-12">
      <div class="card bg-light mb-3 border-dark border shadow-sm">
        <Preview
            class="card-img-top"
            style="width: 100%"
            :data="recording"
            :editable="false"
            @bookmark="bookmark"
            @generate-preview="generatePreview"
            :place-holder-image="placeHolderImage"
            @destroy="destroyRecording"
            @selected="load"
            :showDuration="false"
            :total="recordings.length"
            :preview-video="baseUrl + '/' + recording.previewVideo.replaceAll('\\', '/')"
            :index="i+1"/>
        <div class="card-body bg-primary">
          <div class="card-title px-3 py-2 fw-bold text-white">
            {{ recording.channelName }}
          </div>
        </div>
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
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import Preview from '@/components/Preview.vue';
import { defineComponent } from 'vue';
import RecordInfo from '@/components/RecordInfo.vue';

interface RecordingData {
  baseUrl?: string;
  busy?: boolean;
  recordings: RecordingResponse[];
  selectedFolder: string;
  type: string;
}

const recordingApi = new RecordingApi();

export default defineComponent({
  name: 'Recording',
  components: { Preview, RecordInfo },
  inject: ['baseUrl', 'apiUrl'],
  emits: ['load'],
  props: {
    limit: Number,
  },
  watch: {
    $route() {
      this.fetch();
    }
  },
  data(): RecordingData {
    return {
      recordings: [],
      selectedFolder: '',
      type: this.$route.params.type as string,
    };
  },
  methods: {
    bookmark(recording: RecordingResponse, yesNo: boolean) {
      recordingApi.bookmark(recording.channelName, recording.filename, yesNo)
          .then(() => {
            for (let i = 0; i < this.recordings.length; i++) {
              console.log(1);
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
    fetch() {
      this.recordings = [];
      const limit = this.$route.params.limit as string;
      recordingApi.getGallery(this.$route.params.type as string, limit || 30).then(res => this.recordings = res.data);
    },
    viewFolder(channel: string) {
      this.$router.push('/recordings/' + channel);
    },
    destroyRecording(recording: RecordingResponse) {
      if (!window.confirm(`Delete '${recording.filename}'?`)) {
        return;
      }

      recordingApi.destroy(recording.channelName, recording.filename).then(() => {
        for (let i = 0; i < this.recordings.length; i += 1) {
          if (this.recordings[i].filename === recording.filename) {
            this.recordings.splice(i, 1);
            break;
          }
        }
        // Let the ui update
      }).catch(err => {
        console.error(err);
        alert(err);
      });
    },
  },
  mounted() {
    this.fetch();
  }
});
</script>

<style scoped>

</style>
