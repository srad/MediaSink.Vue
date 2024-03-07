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
                <tr v-for="(cpu, i) in infoResponse.cpuInfo.loadCpu" :key="i">
                  <td class="text-end align-middle">{{ cpu.cpu }}</td>
                  <td class="align-middle">
                    <div class="progress m-2">
                      <div class="progress-bar" role="progressbar" :style="{width: (cpu.load*100) + '%'}" aria-valuenow="0"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                    </div>
                  </td>
                  <td class="text-end align-middle">{{ (cpu.load * 100).toFixed(0) }}%</td>
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
                      <div class="progress-bar" role="progressbar" :style="{width: infoResponse.diskInfo.pcent}" aria-valuenow="0"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="text-center">
                    <span class="fs-5">{{ infoResponse.diskInfo.pcent }}</span> |
                    <span class="fs-5">Usage {{ infoResponse.diskInfo.used }}/{{ infoResponse.diskInfo.size }}</span>
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
                <li class="list-group-item">Name: {{ infoResponse.netInfo.dev }}</li>
                <li class="list-group-item">
                  Received: {{ (infoResponse.netInfo.receiveBytes / 1024 / 1024).toFixed(2) }}MB
                </li>
                <li class="list-group-item">
                  Transmitted: {{ (infoResponse.netInfo.transmitBytes / 1024 / 1024).toFixed(2) }}MB
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LoadIndicator>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createClient } from "@/services/api/v1/ClientFactory";
import { HelpersSysInfo } from "@/services/api/v1/StreamSinkClient";
import LoadIndicator from '@/components/LoadIndicator.vue';

//import CPUChart from '@/components/charts/CPUChart.vue';
//import NetworkChart from '@/components/charts/NetworkChart.vue';

const api = createClient();

interface AdminData {
  importing: boolean;
  loaded: boolean;
  build?: string;
  isUpdating: boolean;
  id: number;
  infoResponse: HelpersSysInfo;
  cpuData: {
    labels: string[],
    datasets: {
      label: string,
      backgroundColor: string,
      data: any[]
    }[]
  } | null;
  options: any;
}

function getRandomInt(): number {
  return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
}

export default defineComponent({
  name: 'AdminView',
  components: { LoadIndicator },
  inject: [ 'build' ],
  //components: { CPUChart, NetworkChart },
  data(): AdminData {
    return {
      loaded: false,
      importing: false,
      isUpdating: false,
      cpuData: {
        labels: [ 'A', 'B' ],
        datasets: [
          {
            backgroundColor: 'rgb(77, 186, 135)',
            label: 'Game Overs',
            data: []
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      },
      id: 0,
      infoResponse: {
        cpuInfo: { loadCpu: [] },
        diskInfo: { avail: '', pcent: '', size: '', used: '' },
        netInfo: { dev: '', receiveBytes: 0, transmitBytes: 0 },
      }
    };
  },
  methods: {
    async startImport() {
      if (window.confirm('Start Import?')) {
        await api.admin.importCreate();
        this.importing = true;
      }
    },
    async posters() {
      if (window.confirm('Regenerate all posters?')) {
        await api.recordings.generatePostersCreate();
      }
    },
    fillData() {
      this.cpuData = {
        labels: [ 'A', 'B' ],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [ getRandomInt(), getRandomInt() ]
          }, {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [ getRandomInt(), getRandomInt() ]
          }
        ]
      };
    },
    updateInfo() {
      if (window.confirm('Check all durations and update in database?')) {

        api.recordings.updateinfoCreate()
            .then(() => this.isUpdating = true)
            .catch(res => alert(res.error));
      }
    },
    fetch() {
      api.info.infoDetail(1).then(res => {
        this.infoResponse.netInfo = res.data.netInfo;
        this.infoResponse.diskInfo = res.data.diskInfo;
        this.infoResponse.cpuInfo = res.data.cpuInfo;
        api.admin.importingList().then(res => this.importing = res.data);
        // TODO: not implemented yet
        //api.recordings.isupdatingList().then(res => this.isUpdating = res.data);
      }).catch(res => alert(res.error))
          .finally(() => this.loaded = true);
    }
  },
  beforeRouteLeave() {
    clearInterval(this.id);
  },
  created() {
    this.id = setInterval(this.fetch, 2500);
  },
  mounted() {
    this.fillData();
  },
});
</script>

<style scoped>

</style>
