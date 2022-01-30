<template>
  <div class="container-fluid pt-2">
    <div class="row">
      <div class="col">
        <button class="btn btn-warning me-2" @click="updateInfo">
          Update All Video Infos
        </button>
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
                <th class="text-end" style="width: 10px">#</th>
                <th>Load %</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(cpu, i) in cpuUsage" :key="i">
                <td class="text-end align-middle">{{ i }}</td>
                <td class="align-middle">
                  <div class="progress m-2">
                    <div class="progress-bar" role="progressbar" :style="{width: cpu + '%'}" aria-valuenow="0"
                         aria-valuemin="0"
                         aria-valuemax="100"></div>
                  </div>
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
                    <div class="progress-bar" role="progressbar" :style="{width: diskPercent + '%'}" aria-valuenow="0"
                         aria-valuemin="0"
                         aria-valuemax="100"></div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="text-center">
                  <span class="fs-5">{{ diskPercent }}%</span> |
                  <span class="fs-5">Usage {{ diskFreeGB }}/{{ diskTotalDB }}GB</span>
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
              <li class="list-group-item">Name: {{ network.name }}</li>
              <li class="list-group-item">Received: {{ (network.receivedBytes / 1024 / 1024).toFixed(2) }}MB</li>
              <li class="list-group-item">Transmitted: {{ (network.transmittedBytes / 1024 / 1024).toFixed(2) }}MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { InfoApi, InfoResponse } from '@/services/api/v1/infoApi';
import { defineComponent } from 'vue';
import { RecordingApi } from '@/services/api/v1/recordingApi';

const api = new InfoApi();

interface AdminData extends InfoResponse {
  id: number;
  recordingApi: RecordingApi;
}

export default defineComponent({
  name: 'AdminView',
  data(): AdminData {
    return {
      recordingApi: new RecordingApi(),
      id: 0,
      cpuUsage: [],
      diskTotal: 0,
      diskFree: 0,
      network: {
        name: '',
        receivedBytes: 0,
        transmittedBytes: 0,
        measureSeconds: 0,
      }
    };
  },
  computed: {
    diskFreeGB(): string {
      return (this.diskFree / 1024 / 1024 / 1024).toFixed(2);
    },
    diskTotalDB(): string {
      return (this.diskTotal / 1024 / 1024 / 1024).toFixed(2);
    },
    diskPercent(): string {
      return (this.diskFree / this.diskTotal * 100).toFixed(2);
    },
  },
  methods: {
    updateInfo() {
      if (window.confirm('Check all durations and update in database?')) {

        this.recordingApi.updateInfo()
            .catch(err => alert(err));
      }
    },
    fetch() {
      api.fetch(2).then(res => {
        this.cpuUsage = res.data.cpuUsage;
        this.diskTotal = res.data.diskTotal;
        this.diskFree = res.data.diskFree;
        this.network.name = res.data.network.name;
        this.network.receivedBytes = res.data.network.receivedBytes;
        this.network.transmittedBytes = res.data.network.transmittedBytes;
        this.network.measureSeconds = res.data.network.measureSeconds;
        console.log('Update');
      });
    }
  },
  beforeRouteLeave() {
    clearInterval(this.id);
  },
  mounted() {
    this.fetch();
    this.id = setInterval(() => this.fetch, 3000);
  }
});
</script>

<style scoped>

</style>
