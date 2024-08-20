<template>
  <ul class="nav nav-tabs my-2" id="pills-tab" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
        {{ $t('job.tab.workerJobs') }}
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
        {{ $t('job.tab.recordings') }}
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="pills-processes-tab" data-bs-toggle="pill" data-bs-target="#pills-processes" type="button" role="tab" aria-controls="pills-processes" aria-selected="false">
        {{ $t('job.tab.processes') }}
      </button>
    </li>
  </ul>
  <div class="tab-content" id="pills-tabContent">
    <div class="tab-pane fade show active" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
      <JobTable :jobs="workerJobs" @destroy="destroy"/>
    </div>
    <div class="tab-pane fade" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
      <JobTable :jobs="recordings" @destroy="destroy"/>
    </div>
    <div class="tab-pane fade" id="pills-processes" role="tabpanel" aria-labelledby="pills-processes-tab">
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
          <tr>
            <th class="bg-light" style="width: 10%">Channel-Id</th>
            <th class="bg-light" style="width: 10%">Pid</th>
            <th class="bg-light" style="width: 10%">Path</th>
            <th class="bg-light">Args</th>
            <th class="bg-light">Output</th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="processes.length===0">
            <td colspan="5">
              None
            </td>
          </tr>
          <tr v-else v-for="p in processes">
            <td>{{ p.id }}</td>
            <td>{{ p.pid }}</td>
            <td>{{ p.path }}</td>
            <td>
              <textarea disabled class="form-control" rows="5">{{ p.args }}</textarea>
            </td>
            <td>
              <textarea disabled class="form-control" rows="5">{{ p.output }}</textarea>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { createClient } from '../services/api/v1/ClientFactory';
import JobTable from '../components/JobTable.vue';
import { ModelsJob, ModelsProcessInfo } from '../services/api/v1/StreamSinkClient';
import moment from 'moment';
import { useStore } from "../store";

const api = createClient();
const store = useStore();

const processes = ref<ModelsProcessInfo[]>([]);

export interface JobTableItem extends ModelsJob {
  fromNow?: string;
}

const recordings = computed(() => {
  return store.state.jobs.filter(job => job.status === 'recording').map(job => {
    const newJob: JobTableItem = { ...job };
    newJob.fromNow = moment(newJob.createdAt).fromNow();
    return newJob;
  });
});

const workerJobs = computed(() => {
  return store.state.jobs.filter(job => job.status !== 'recording').map(job => {
    const newJob: JobTableItem = { ...job };
    newJob.fromNow = moment(newJob.createdAt).fromNow();
    return newJob;
  });
});

const destroy = (id: number) => {
  api.jobs.jobsDelete(id)
      .then(() => store.commit('destroyJob', id))
      .catch(res => alert(res.error));
};

onBeforeMount(() => {
  Promise.all([ api.jobs.jobsList(), api.processes.processesList() ])
      .then(res => {
        store.commit('jobs:refresh', res[0].data);
        processes.value = res[1].data || [];
      });
});
</script>

<style scoped>
</style>