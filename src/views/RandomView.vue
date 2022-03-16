<template>
  <div class="row mt-3">
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
            <div class="col-auto">
              <button class="btn btn-primary" @click="fetch">Refresh</button>
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
  <div class="row">
    <LoadIndicator :busy="busy" :empty="recordings.length === 0" empty-text="No Videos">
      <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem :show-title="true" :recording="recording" @destroyed="destroyRecording"/>
      </div>
    </LoadIndicator>
  </div>
</template>

<script lang="ts">
import { RecordingApi, RecordingResponse } from '@/services/api/v1/recordingApi';
import RecordingItem from '@/components/RecordingItem.vue';
import { defineComponent } from 'vue';
import LoadIndicator from '@/components/LoadIndicator.vue';

interface RecordingData {
  baseUrl?: string;
  busy: boolean;
  recordings: RecordingResponse[];
  selectedStream: string;
  limits: number[];
  filterLimit: string;
}

const recordingApi = new RecordingApi();

export default defineComponent({
  name: 'Recording',
  components: { LoadIndicator, RecordingItem },
  inject: ['baseUrl', 'apiUrl'],
  emits: ['load'],
  watch: {
    $route() {
      this.fetch();
    }
  },
  data(): RecordingData {
    return {
      busy: true,
      filterLimit: this.$route.params.limit as string || '25',
      limits: [
        25,
        50,
        100,
        200,
      ],
      recordings: [],
      selectedStream: '',
    };
  },
  methods: {
    fetch() {
      this.recordings = [];
      recordingApi.getGallery('random', this.filterLimit).then(res => {
        this.recordings = res.data;
        this.busy = false;
      });
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
