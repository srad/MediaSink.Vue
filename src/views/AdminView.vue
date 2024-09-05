<template>
  <div class="container-fluid my-3">
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

    <div class="table-responsive border-secondary border m-0 p-0">
      <table class="table table-bordered m-0">
        <thead>
        <tr style="visibility: collapse">
          <th style="width: 25%"></th>
          <th></th>
        </tr>
        <tr rowspan="2">
          <th class="text-end bg-light" colspan="2">
            <div class="btn-group btn-group-sm">
              <button type="button" :disabled="isUpdating" class="btn btn-primary me-2" @click="updateInfo" :class="{'blink btn-danger': isUpdating}">
                <span class="me-2">Update video metadata</span>
                <i class="bi bi-arrow-clockwise"></i>
              </button>
              <button class="btn btn-primary me-2" @click="posters">
                <span class="me-2">Regenerate posters</span>
                <i class="bi bi-card-image"></i>
              </button>

              <button :disabled="importing" class="btn btn-primary" @click="startImport">
                <span class="me-2">Start Import</span>
                <i class="bi bi-disc"></i>
              </button>
            </div>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td class="bg-light-subtle align-middle">
            CPU Load <span v-if="cpuInfo">({{ mainCpuLoad.toFixed(1) }}%)</span>
          </td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: mainCpuLoad + '%' }" aria-valuenow="0"
                   aria-valuemin="0"
                   aria-valuemax="100"></div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="bg-light-subtle align-middle">Disk usage ({{ diskInfo?.pcent || 0 }})</td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: diskInfo?.pcent}" aria-valuenow="0"
                   aria-valuemin="0"
                   aria-valuemax="100"></div>
            </div>
          </td>
        </tr>
        <tr v-if="importing">
          <td class="align-middle" :class="{'blink bg-danger-subtle': importing}">
            Importing ({{ importProgress }}/{{ importSize }})
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
          </td>
        </tr>
        <tr>
          <td class="bg-light-subtle align-middle">Network-Transmitted</td>
          <td>
            {{ transmittedMb }} MB
          </td>
        </tr>
        <tr>
          <td class="bg-light-subtle align-middle">Network-Received</td>
          <td>
            {{ receivedMb }} MB
          </td>
        </tr>
        <tr>
          <td colspan="2" class="p-0 ">
          </td>
        </tr>
        <tr v-for="version in versions">
          <td class="bg-light-subtle align-middle">
            {{ version[0] }}
          </td>
          <td class="align-middle">{{ version[1] }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted } from 'vue';
import { createClient } from '../services/api/v1/ClientFactory';
import {
  HelpersCPUInfo,
  HelpersDiskInfo, HelpersNetInfo,
  ResponseServerInfo
} from '../services/api/v1/StreamSinkClient';
import { onBeforeRouteLeave } from 'vue-router';

//import CPUChart from '../charts/CPUChart.vue';
//import NetworkChart from '../charts/NetworkChart.vue';

const api = createClient();

const build = inject('build');
const version = inject('version');

const versions = computed(() => [
  ['Client-Version', version],
  ['Client-Revision', build],
  ['Server-Version', serverInfo.value?.version],
  ['Server-Revision', serverInfo.value?.commit],
]);

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

const id = ref<number | NodeJS.Timeout>(0);

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

const fetch = async () => {
  try {
    const result = await Promise.all([api.info.infoDetail(1), api.admin.importList()]);

    netInfo.value = result[0].data.netInfo;
    cpuInfo.value = result[0].data.cpuInfo;
    diskInfo.value = result[0].data.diskInfo;

    importing.value = result[1].data.isImporting || false;
    importProgress.value = result[1].data.progress || 0;
    importSize.value = result[1].data.size || 0;
  } catch (err) {
    alert(err);
  }
};

onBeforeRouteLeave(() => {
  clearInterval(id.value);
});

onMounted(async () => {
  //fillData();
  await fetch();
  const res = await api.admin.versionList();
  serverInfo.value = res.data;
  id.value = setInterval(fetch, 2500);
});
</script>

<style scoped>
</style>
