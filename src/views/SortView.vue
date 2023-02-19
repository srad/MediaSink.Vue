<template>
  <div class="my-2">
    <div class="row my-3">
      <div class="col">
        <div class="d-flex justify-content-end">
          <div class="d-flex justify-content-center me-3">
            <!-- filter row -->
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="limit" class="col-form-label fw-bold">
                  {{ $t("filter.label.orderBy") }}
                </label>
              </div>
              <div class="col-auto">
                <select class="form-select" v-model="filterColumn" @change="routeFilter">
                  <option v-for="col in columns" :key="col" :value="col[1]">{{ col[0] }}</option>
                </select>
              </div>
              <div class="col-auto">
                <label for="limit" class="col-form-label fw-bold">
                  {{ $t("filter.label.order") }}
                </label>
              </div>
              <div class="col-auto">
                <select class="form-select text-capitalize" v-model="filterOrder" @change="routeFilter">
                  <option v-for="o in order" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
              <div class="col-auto">
                <label for="limit" class="col-form-label fw-bold">
                  {{ $t("filter.label.limit") }}
                </label>
              </div>
              <div class="col-auto">
                <select id="limit" class="form-select" v-model="filterLimit" @change="routeFilter">
                  <option v-for="limit in limits" :key="limit" :value="limit">{{ limit }}</option>
                </select>
              </div>
            </div>
            <!-- filter row -->
          </div>
          <button class="btn btn-primary" @click="routeFilter" v-if="$route.params.type==='random'">
            Refresh
          </button>
        </div>
        <hr/>
      </div>
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
  type: string;
  limits: number[];
  columns: string[][];
  order: string[];
  filterLimit: string;
  filterColumn: string;
  filterOrder: string;
}

const recordingApi = new RecordingApi();

export default defineComponent({
  name: 'streamsink-sortview',
  components: { LoadIndicator, RecordingItem },
  inject: ['baseUrl', 'apiUrl'],
  emits: ['load'],
  watch: {
    '$route.query'() {
      this.fetch();
    }
  },
  data(): RecordingData {
    return {
      busy: true,
      filterOrder: this.$route.query.order as string || 'desc',
      filterColumn: this.$route.query.column as string || 'created_at',
      filterLimit: this.$route.query.limit as string || '25',
      limits: [
        25,
        50,
        100,
        200,
      ],
      columns: [['Created at', 'created_at'], ['Filesize', 'size'], ['Video duration', 'duration']],
      order: ['asc', 'desc'],
      recordings: [],
      selectedStream: '',
      type: this.$route.params.type as string,
    };
  },
  methods: {
    routeFilter() {
      this.$router.push({
        path: this.$route.path,
        query: {
          order: this.filterOrder,
          column: this.filterColumn,
          limit: this.filterLimit,
        },
        force: true
      });
    },
    fetch() {
      this.busy = true;
      recordingApi.getSorted(this.$route.query.column as string || 'created_at', this.$route.query.order as string || 'desc', this.$route.query.limit as string || '25').then(res => this.recordings = res.data)
          .catch(err => alert(err))
          .finally(() => this.busy = false);
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
