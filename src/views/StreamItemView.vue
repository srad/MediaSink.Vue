<template>
  <div>

    <nav class="navbar fixed-bottom navbar-light bg-light border-info border-top">
      <div class="container-fluid justify-content-end w-100">
        <button class="btn btn-danger me-3">
          Delete Stream
        </button>

        <button class="btn btn-info text-white" @click="$refs.file.click()">
          <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
          Upload Video
        </button>
      </div>
    </nav>

    <div class="row pb-5">
      <h4 class="py-0"><span class="text-primary">{{ $route.params.channel }}</span></h4>
      <hr/>
      <div v-if="recordings.length === 0" class="d-flex justify-content-center">
        <h3 class="text-dark">
          No Videos
        </h3>
      </div>
      <div v-else v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-4 col-xl-3 col-xxl-2 col-md-12">
        <RecordingItem :recording="recording" @destroyed="destroyRecording"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import { defineComponent } from 'vue';
import RecordingItem from '@/components/RecordingItem.vue';
import { ChannelApi } from '@/services/api/v1/channelApi';

const recordingApi = new RecordingApi();
const channelApi = new ChannelApi();

interface RecordingData {
  apiUrl?: string;
  baseUrl?: string;
  channelName: string;
  recordings: RecordingResponse[];
  busy: boolean;
}

export default defineComponent({
  name: 'StreamItemView',
  components: { RecordingItem },
  inject: ['baseUrl', 'apiUrl', 'fileUrl'],
  watch: {
    $route() {
      this.recordings = [];
    },
  },
  data(): RecordingData {
    return {
      busy: false,
      recordings: [],
      channelName: this.$route.params.channel as string,
    };
  },
  methods: {
    submit() {
      const el = this.$refs.file as HTMLInputElement;
      if (el.files && el.files!.length > 0) {
        channelApi.upload(this.channelName, el.files![0], pcent => {
          console.log('Progress: ' + pcent);
        }).then(res => {
          this.recordings.unshift(res.data);
          // clear old file
          el.value = '';
        });
      }
    },
    destroyRecording(recording: RecordingResponse) {
      for (let i = 0; i < this.recordings.length; i += 1) {
        if (this.recordings[i].filename === recording.filename) {
          this.recordings.splice(i, 1);
          break;
        }
      }
    }
  },
  mounted() {
    //@ts-ignore
    recordingApi.getRecordings(this.channelName).then(res => {
      this.recordings = res.data;
      this.busy = false;
      window.scrollTo(0, 0);
    }).catch(err => {
      this.busy = false;
      alert(err);
    });
  }
});
</script>

<style scoped>

</style>
