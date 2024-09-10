<template>
  <ul class="nav nav-tabs my-2" id="pills-tab" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
        {{ t('general.jobs') }}
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="pills-processes-tab" data-bs-toggle="pill" data-bs-target="#pills-processes" type="button" role="tab" aria-controls="pills-processes" aria-selected="false">
        {{ t('general.streams') }}
      </button>
    </li>
  </ul>
  <div class="tab-content" id="pills-tabContent">
    <div class="tab-pane fade show active" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
      <JobTable :jobs="jobs" @destroy="destroy"/>
    </div>
    <div class="tab-pane fade" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">

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
import { computed, onMounted, ref } from 'vue';
import { createClient } from '../services/api/v1/ClientFactory';
import JobTable from '../components/JobTable.vue';
import { DatabaseJob, ServicesProcessInfo as ProcessInfo } from '../services/api/v1/StreamSinkClient';
import { fromNow } from "../utils/datetime.ts";
import { useStore } from "../store";
import { Tab } from 'bootstrap';
import {useI18n} from 'vue-i18n'

const {t} = useI18n();

const api = createClient();
const store = useStore();

const processes = ref<ProcessInfo[]>([]);

export interface JobTableItem extends DatabaseJob {
  fromNow?: string;
}

const res = await Promise.all([ api.jobs.jobsList(), api.processes.processesList() ]);
store.commit('jobs:refresh', res[0].data);
processes.value = res[1].data || [];

const jobs = computed(() => {
  return store.getters.getRecordings.map((job: DatabaseJob) => {
    const newJob: JobTableItem = { ...job };
    newJob.fromNow = fromNow(new Date(newJob.createdAt));
    return newJob;
  });
});

const destroy = (id: number) => {
  api.jobs.jobsDelete(id)
      .then(() => store.commit('destroyJob', id))
      .catch(res => alert(res.error));
};

onMounted(() => {
  const triggerTabList = document.querySelectorAll('#pills-tab button')
  triggerTabList.forEach(triggerEl => {
    const tabTrigger = new Tab(triggerEl);

    triggerEl.addEventListener('click', event => {
      event.preventDefault();
      tabTrigger.show();
    })
  });
})
</script>

<style scoped>
</style>