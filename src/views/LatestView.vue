<template>
  <div>
    <div class="row">
      <div class="col">
        <div class="d-flex justify-content-end">
          <div class="d-flex justify-content-center me-3">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="limit" class="col-form-label fw-bold">Limit</label>
              </div>
              <div class="col-auto">
                <select id="limit" class="form-select" v-model="filterLimit" @change="fetch">
                  <option v-for="limit in limits" :key="limit" :value="limit">{{ limit }}</option>
                </select>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" @click="fetch" v-if="$route.params.type==='random'">
            Refresh
          </button>
        </div>
        <hr/>
      </div>
    </div>
  </div>
  <div class="row">
    <div v-if="recordings.length === 0" class="d-flex justify-content-center">
      <h3 class="text-dark">
        No Videos
      </h3>
    </div>
    <div v-else v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-4 col-xl-3 col-xxl-2 col-md-12">
      <RecordingItem :show-title="true" :recording="recording" @destroyed="destroyRecording"/>
    </div>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import RecordingItem from '@/components/RecordingItem.vue';
import { defineComponent } from 'vue';

interface RecordingData {
  baseUrl?: string;
  busy?: boolean;
  recordings: RecordingResponse[];
  selectedStream: string;
  type: string;
  limits: number[];
  filterLimit: string;
}

const recordingApi = new RecordingApi();

export default defineComponent({
  name: 'Recording',
  components: { RecordingItem },
  inject: ['baseUrl', 'apiUrl'],
  emits: ['load'],
  watch: {
    $route() {
      this.fetch();
    }
  },
  data(): RecordingData {
    return {
      filterLimit: this.$route.params.limit as string || '25',
      limits: [
        25,
        50,
        100,
        200,
      ],
      recordings: [],
      selectedStream: '',
      type: this.$route.params.type as string,
    };
  },
  methods: {
    fetch() {
      this.recordings = [];
      recordingApi.getGallery(this.$route.params.type as string, this.filterLimit).then(res => this.recordings = res.data);
    },
    viewFolder(channel: string) {
      this.$router.push('/recordings/' + channel);
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
    this.fetch();
  }
});
</script>

<style scoped>

</style>
