<template>
  <div class="my-2">
    <div class="row my-3">
      <div class="col">
        <div class="d-flex justify-content-end">
          <div class="d-flex justify-content-center me-3">
            <!-- filter row -->
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <select ref="filterColumnSelect" class="form-select" v-model="filterColumn" @change="routeFilter">
                  <option value="" style="font-weight: bold" disabled>{{ $t("filter.orderBy") }}</option>
                  <option v-for="col in columns" :key="col[1]" :value="col[1]">{{ col[0] }}</option>
                </select>
              </div>
              <div class="col-auto">
                <select ref="sortOrderSelect" class="form-select text-capitalize" v-model="filterOrder" @input="routeFilter">
                  <option value="" style="font-weight: bold" disabled>{{ $t("filter.order") }}</option>
                  <option v-for="o in order" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
              <div class="col-auto">
                <select ref="filterLimitSelect" id="limit" class="form-select" v-model="filterLimit" @change="routeFilter">
                  <option value="" style="font-weight: bold" disabled>{{ $t("filter.limit") }}</option>
                  <option v-for="limit in limits" :key="limit" :value="limit">{{ limit }}</option>
                </select>
              </div>

              <div class="col-auto">
                <button type="button" class="btn btn-primary" @click="resetFilters">{{ $t("filter.reset") }}</button>
              </div>
            </div>
            <!-- filter row -->
          </div>
          <button class="btn btn-primary" @click="routeFilter" v-if="route.params.type==='random'">
            Refresh
          </button>
        </div>
        <hr/>
      </div>
    </div>
  </div>
  <div class="row">
    <LoadIndicator :busy="busy" :empty="recordings.length === 0" empty-text="No Videos">
      <div v-for="recording in recordings" :key="recording.recordingId" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem :show-title="true" :recording="recording" @destroyed="destroyRecording" :show-selection="false"/>
      </div>
    </LoadIndicator>
  </div>
</template>

<script setup lang="ts">
import { createClient } from "../services/api/v1/ClientFactory";
import { ModelsRecording as RecordingResponse } from "../services/api/v1/StreamSinkClient";
import RecordingItem from '../components/RecordingItem.vue';
import { onBeforeMount, ref, watch } from 'vue';
import LoadIndicator from '../components/LoadIndicator.vue';
import { useRoute, useRouter } from "vue-router";

const api = createClient();

const route = useRoute();
const router = useRouter();

watch(() => route.query, () => fetch());

const busy = ref(true);
const sortOrderSelect = ref<HTMLSelectElement | null>(null);
const filterColumnSelect = ref<HTMLSelectElement | null>(null);
const filterLimitSelect = ref<HTMLSelectElement | null>(null);
let filterOrder = route.query.order as string || 'desc';
let filterColumn = route.query.column as string || 'created_at';
let filterLimit = route.query.limit as string || '25';
const limits = ref([
  25,
  50,
  100,
  200,
]);

const columns = [ [ 'Created at', 'created_at' ], [ 'Filesize', 'size' ], [ 'Video duration', 'duration' ] ];

const order = [ 'asc', 'desc' ];

const recordings = ref<RecordingResponse[]>([]);

const routeFilter = () => {
  router.replace({
    path: route.path,
    query: {
      order: sortOrderSelect.value?.value,
      column: filterColumnSelect.value?.value,
      limit: filterLimitSelect.value?.value,
    },
    force: true
  });
};

const resetFilters = () => {
  filterOrder = order[1];
  filterColumn = columns[0][1];
  filterLimit = "25";
  routeFilter()
};

const fetch = () => {
  busy.value = true;
  api.recordings.filterDetail(route.query.column as string || 'created_at', route.query.order as string || 'desc', route.query.limit as string || '25')
      .then(res => recordings.value = res.data)
      .catch(err => alert(err))
      .finally(() => busy.value = false);
};

const destroyRecording = (recording: RecordingResponse) => {
  for (let i = 0; i < recordings.value.length; i += 1) {
    if (recordings.value[i].filename === recording.filename) {
      recordings.value.splice(i, 1);
      break;
    }
  }
};
onBeforeMount(fetch);
</script>