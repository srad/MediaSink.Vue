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
          <button disabled class="btn btn-secondary me-2" :class="{'blink btn-danger': importing, 'btn-secondary': !importing}" @click="posters">
            Importing
          </button>

          <span>{{ build }}</span>
        </div>
      </div>

      <hr/>

      <div class="row">
        <div class="col">
          <div class="card shadow-sm border border-secondary">
            <div class="card-header bg-info p-1 ps-2 pe-2 text-white fs-5">
              CPUs
            </div>
            <div class="card-body p-2">
              <table class="table table-sm p-0 m-0">
                <thead>
                <tr>
                  <th class="text-end" style="width: 30px">CPU</th>
                  <th>Load</th>
                  <th class="text-end" style="width: 30px">%</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(cpu, i) in cpuInfo.datasets[0].data" :key="i">
                  <td class="text-end align-middle">{{ cpu.cpu }}</td>
                  <td class="align-middle">
                    <div class="progress m-2">
                      <div class="progress-bar" role="progressbar" :style="{width: (cpu.load!*100) + '%'}" aria-valuenow="0"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                    </div>
                  </td>
                  <td class="text-end align-middle">{{ (cpu.load! * 100).toFixed(0) }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card shadow-sm border border-secondary">
            <div class="card-header bg-info p-1 ps-2 pe-2 text-white fs-5">
              Disk
            </div>
            <div class="card-body p-2">
              <table class="table table-sm p-0 m-0">
                <thead>
                <tr>
                  <th>Load %</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td class="align-middle">
                    <div class="progress m-2">
                      <div class="progress-bar" role="progressbar" :style="{width: info.diskInfo!.pcent}" aria-valuenow="0"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="fs-5">{{ info.diskInfo!.pcent }}</span> |
                    <span class="fs-5">Usage {{ info.diskInfo!.used }}/{{ info.diskInfo!.size }}</span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card shadow-sm border border-secondary">
            <div class="card-header bg-info p-1 ps-2 pe-2 text-white fs-5">
              Network IO
            </div>
            <div class="card-body p-2">
              <ul class="list-group">
                <li class="list-group-item">Name: {{ info.netInfo!.dev }}</li>
                <li class="list-group-item">
                  Received: {{ receiveBytes }}MB
                </li>
                <li class="list-group-item">
                  Transmitted: {{ transmitBytes }}MB
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LoadIndicator>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, reactive, onMounted } from 'vue';
import { createClient } from "../services/api/v1/ClientFactory";
import { HelpersCPULoad } from "../services/api/v1/StreamSinkClient";
import LoadIndicator from '../components/LoadIndicator.vue';
import { onBeforeRouteLeave } from "vue-router";

//import CPUChart from '../charts/CPUChart.vue';
//import NetworkChart from '../charts/NetworkChart.vue';

const api = createClient();

const build = inject('build');

const loaded = ref(false);
const importing = ref(false);
const isUpdating = ref(false);

const info = reactive({
  cpuInfo: { loadCpu: [] },
  diskInfo: { avail: '', pcent: '', size: '', used: '' },
  netInfo: { dev: '', receiveBytes: 0, transmitBytes: 0 },
});

const cpuInfo = reactive<{
  labels: string[],
  datasets: { backgroundColor: string, label: string, data: HelpersCPULoad[] }[]
}>({
  labels: [ 'A', 'B' ],
  datasets: [
    {
      backgroundColor: 'rgb(77, 186, 135)',
      label: 'Game Overs',
      data: []
    }
  ]
});

const id = ref(0);

const receiveBytes = computed(() => (info.netInfo!.receiveBytes! / 1024 / 1024).toFixed(2));
const transmitBytes = computed(() => (info.netInfo!.transmitBytes! / 1024 / 1024).toFixed(2));

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

const fillData = () => {
  cpuInfo.labels = [ 'A', 'B' ];
  cpuInfo.datasets = []
};

const updateInfo = () => {
  if (window.confirm('Check all durations and update in database?')) {

    api.recordings.updateinfoCreate()
        .then(() => isUpdating.value = true)
        .catch(res => alert(res.error));
  }
};

const fetch = () => {
  api.info.infoDetail(1).then(res => {
    if (res.data.netInfo) {
      info.netInfo.dev = res.data.netInfo.dev!;
      info.netInfo.receiveBytes = res.data.netInfo.receiveBytes!;
      info.netInfo.transmitBytes = res.data.netInfo.transmitBytes!;
    }

    if (res.data.cpuInfo) {
      cpuInfo.datasets[0].data = res.data.cpuInfo.loadCpu!;
    }

    api.admin.importingList().then(res => importing.value = res.data);
    // TODO: not implemented yet
    //api.recordings.isupdatingList().then(res => this.isUpdating = res.data);
  }).catch(res => alert(res.error))
      .finally(() => loaded.value = true);
};

onBeforeRouteLeave(() => {
  clearInterval(id.value);
});

onMounted(() => {
  fillData();
  id.value = setInterval(fetch, 2500);
});
</script>

<style scoped>
</style>