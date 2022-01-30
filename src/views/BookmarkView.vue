<template>
  <div class="row">
    <div v-if="recordings.length === 0" class="justify-content-center d-flex p-5 col">
      <h2>
        Empty
      </h2>
    </div>
    <div v-else v-for="(recording, i) in recordings" :key="i" class="col-lg-4 col-xl-2 col-md-12">
      <div class="card bg-light mb-3 border-dark border shadow-sm bg-light">
        <Preview class="card-img-top" :data="recording" :place-holder-image="placeHolderImage"
                 @selected="load" :preview-video="baseUrl + '/' + recording.previewVideo.replaceAll('\\', '/')"/>

        <div class="card-body">
          <div class="card-title p-1 bg-primary">
            <h6 class="p-2 m-0 text-white">{{ recording.channelName }}</h6>
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
import Preview from '@/components/Preview.vue';
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import RecordInfo from '@/components/RecordInfo.vue';

interface BookmarkData {
  baseUrl?: string;
  apiUrl?: string;
  placeHolderImage: string;
  recordings: RecordingResponse[];
}

const recordingApi = new RecordingApi();

export default defineComponent({
  components: { Preview, RecordInfo },
  inject: ['baseUrl', 'apiUrl'],
  data(): BookmarkData {
    return {
      placeHolderImage: 'https://via.placeholder.com/150x100?text=No+Preview', //process.env.VUE_APP_BASE + "/public/preview-placeholder.png",
      recordings: []
    };
  },
  methods: {
    bookmark(recording: RecordingResponse, yesNo: boolean) {
      recordingApi.bookmark(recording.channelName, recording.filename, yesNo)
          .then(() => {
            for (let i = 0; i < this.recordings.length; i++) {
              console.log(1);
              if (this.recordings[i].filename === recording.filename) {
                this.recordings.splice(i, 1);
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
      }).catch(err => {
        console.error(err);
        alert(err);
      });
    },
  },
  created() {
    recordingApi.getBookmarks().then(res => {
      this.recordings = res.data;
    });
  }
});
</script>

<style scoped></style>
