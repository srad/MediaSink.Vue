<template>
  <div class="container-fluid my-3">
    <LoadIndicator empty-text="Could not load data" :busy="!loaded">
      <!--
      <div class="row">
        <div class="col">
          <network-chart/>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <c-p-u-chart/>
        </div>
      </div>
      -->

      <div class="row">
        <div class="col">
          <button :disabled="isUpdating" class="btn btn-primary me-2" @click="updateInfo" :class="{'blink btn-danger': isUpdating, 'btn-secondary': !isUpdating}">
            Update Video Metadata
          </button>
          <button class="btn btn-primary me-2" @click="posters">
            Regenerate all posters
          </button>
          <button :disabled="importing" class="btn btn-primary me-2" @click="startImport">
            Start Import
          </button>
        </div>
      </div>

      <table class="table table-bordered my-3">
        <thead style="visibility: collapse">
        <tr>
          <th style="width: 25%"></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="cpuInfo && cpuInfo.loadCpu">
          <td class="bg-light align-middle">CPU Load ({{ cpuInfo.loadCpu[0].cpu }}, {{ mainCpuLoad.toFixed(1) }}%)</td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: mainCpuLoad + '%' }" aria-valuenow="0"
                   aria-valuemin="0"
                   aria-valuemax="100"></div>
            </div>
          </td>
        </tr>
        <tr v-if="diskInfo">
          <td class="bg-light align-middle">Disk usage ({{ diskInfo.pcent }})</td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: diskInfo.pcent}" aria-valuenow="0"
                   aria-valuemin="0"
                   aria-valuemax="100"></div>
            </div>
          </td>
        </tr>
        <tr v-if="importing">
          <td class="bg-light align-middle">
            <button disabled class="btn btn-sm btn-secondary me-2" :class="{'blink btn-danger': importing, 'btn-secondary': !importing}" @click="posters">
              Importing ({{ importProgress }}/{{ importSize }})
            </button>
          </td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: (importProgress/importSize*100) + '%'}" aria-valuenow="{{importProgress}}"
                   aria-valuemin="0"
                   aria-valuemax="{{importSize}}"></div>
            </div>

          </td>
        </tr>
        <tr>
          <td colspan="2" class="p-0 ">
            <hr/>
          </td>
        </tr>
        <tr v-if="netInfo">
          <td class="bg-light align-middle">Network-Transmitted</td>
          <td>{{ transmittedMb }} MB</td>
        </tr>
        <tr v-if="netInfo">
          <td class="bg-light align-middle">Network-Received</td>
          <td>{{ receivedMb }} MB</td>
        </tr>
        <tr>
          <td colspan="2" class="p-0 ">
            <hr/>
          </td>
        </tr>
        <tr>
          <td class="bg-light align-middle">
            Client-Version
          </td>
          <td class="align-middle">{{ version }}</td>
        </tr>
        <tr>
          <td class="bg-light align-middle">
            Client-Revision
          </td>
          <td class="align-middle">{{ build }}</td>
        </tr>
        <tr>
          <td class="bg-light align-middle">
            Server-Version
          </td>
          <td class="align-middle">{{ serverInfo?.version }}</td>
        </tr>
        <tr>
          <td class="bg-light align-middle">
            Server-Revision
          </td>
          <td class="align-middle">{{ serverInfo?.commit }}</td>
        </tr>
        </tbody>
      </table>
    </LoadIndicator>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, reactive, onBeforeMount, onMounted } from 'vue';
import { createClient } from "../services/api/v1/ClientFactory";
import {
  HelpersCPUInfo,
  HelpersDiskInfo, HelpersNetInfo,
  ResponseServerInfo
} from "../services/api/v1/StreamSinkClient";
import LoadIndicator from '../components/LoadIndicator.vue';
import { onBeforeRouteLeave } from "vue-router";

//import CPUChart from '../charts/CPUChart.vue';
//import NetworkChart from '../charts/NetworkChart.vue';

const api = createClient();

const build = inject('build');
const version = inject('version');

const loaded = ref(false);

const importing = ref(false);
const importProgress = ref(0);
const importSize = ref(0);

const isUpdating = ref(false);

// const cpuInfo = reactive<{
//   labels: string[],
//   datasets: { backgroundColor: string, label: string, data: HelpersCPULoad[] }[]
// }>({
//   labels: [ 'A', 'B' ],
//   datasets: [
//     {
//       backgroundColor: 'rgb(77, 186, 135)',
//       label: 'Game Overs',
//       data: []
//     }
//   ]
// });

const serverInfo = ref<ResponseServerInfo | null>(null);

const cpuInfo = ref<HelpersCPUInfo | undefined>(undefined);
const diskInfo = ref<HelpersDiskInfo | undefined>(undefined);
const netInfo = ref<HelpersNetInfo | undefined>(undefined);

const id = ref(0);

const receivedMb = computed(() => ((netInfo.value?.receiveBytes || 0) / 1024 / 1024).toFixed(2));
const transmittedMb = computed(() => ((netInfo.value?.transmitBytes || 0) / 1024 / 1024).toFixed(2));

//@ts-ignore
const mainCpuLoad = computed(() => cpuInfo.value && cpuInfo.value.loadCpu!.length > 0 ? cpuInfo.value.loadCpu[0].load * 100 : 0);

const startImport = async () => {
  if (window.confirm('Start Import?')) {
    await api.admin.importCreate();
    importing.value = true;
  }
};

const posters = async () => {
  if (window.confirm('Regenerate all posters?')) {
    await api.recordings.generatePostersCreate();
  }
};

// const fillData = () => {
//   cpuInfo.labels = [ 'A', 'B' ];
//   cpuInfo.datasets = []
// };

const updateInfo = () => {
  if (window.confirm('Check all durations and update in database?')) {

    api.recordings.updateinfoCreate()
        .then(() => isUpdating.value = true)
        .catch(res => console.error(res.error));
  }
};

const fetch = () => {
  Promise.all([ api.info.infoDetail(1), api.admin.importList() ]).then(result => {
    netInfo.value = result[0].data.netInfo;
    cpuInfo.value = result[0].data.cpuInfo;
    diskInfo.value = result[0].data.diskInfo;

    importing.value = result[1].data.isImporting || false;
    importProgress.value = result[1].data.progress || 0;
    importSize.value = result[1].data.size || 0;
  }).catch(res => console.error(res.error))
      .finally(() => loaded.value = true);
};

onBeforeRouteLeave(() => {
  clearInterval(id.value);
});

onMounted(() => {
  //fillData();
  fetch();
  id.value = setInterval(fetch, 2500);
  api.admin.versionList().then(result => serverInfo.value = result.data);
});
</script>

<style scoped>
</style>