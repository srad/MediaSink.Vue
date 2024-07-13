<template>
  <div class="row my-2">
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
        <RecordingItem :show-title="true" :recording="recording" @destroyed="destroyRecording" :show-selection="false"/>
      </div>
    </LoadIndicator>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { createClient } from '../services/api/v1/ClientFactory';
import RecordingItem from '../components/RecordingItem.vue';
import LoadIndicator from '../components/LoadIndicator.vue';
import { useRoute } from "vue-router";
import { ModelsRecording as RecordingResponse } from "../services/api/v1/StreamSinkClient.ts";

const route = useRoute();

const api = createClient();

watch(route, () => {
  fetch();
});

const busy = ref(true);
const filterLimit = route.params.limit as string || '25';
const limits = ref([
  25,
  50,
  100,
  200,
]);

const recordings = ref<RecordingResponse[]>([]);

const fetch = async () => {
  try {
    const res = await api.recordings.randomDetail(filterLimit);
    recordings.value = res.data;
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};

const destroyRecording = (recording: RecordingResponse) => {
  for (let i = 0; i < recordings.value.length; i += 1) {
    if (recordings.value[i].filename === recording.filename) {
      recordings.value.splice(i, 1);
      break;
    }
  }
};

onMounted(() => {
  fetch();
});
</script>

<style scoped>
</style>