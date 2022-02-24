<template>
  <div class="table-responsive" style="width: 99.9%">
    <table class="table shadow-sm bg-white table-bordered table-hover">
      <thead class="bg-light">
      <tr>
        <th style="width: 20px">Job Id</th>
        <th style="width: 20px">Pid</th>
        <th style="width: 50px">Channel</th>
        <th class="align-bottom" style="width: 50px">File</th>
        <th class="align-bottom d-none d-lg-table-cell" style="width: 60px">Status</th>
        <th class="align-bottom" style="width:70px">Progress</th>
        <th class="align-bottom" style="width:110px">Created</th>
        <th class="align-bottom" style="width:50px">Terminate</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="i" v-for="(job, i) in jobs" :class="{'table-success': job.active}">
        <td class="text-end">
          <div v-if="job.active" style="width: 1rem; height: 1rem" class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          {{ job.jobId }}
        </td>
        <td class="text-end">
          {{ job.pid }}
        </td>
        <td>{{ job.channelName }}</td>
        <td>{{ job.filename }}</td>
        <td>{{ job.status }}</td>
        <td>
          <div v-if="job.active" class="progress">
            <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" :style="'width:'+ job.progress + '%'" :aria-valuenow="job.progress" aria-valuemin="0" :aria-valuemax="100"></div>
          </div>
        </td>
        <td>{{ job.createdAt }}</td>
        <td class="justify-content-center d-flex">
          <button class="btn btn-warning btn-sm" @click="term(job.pid)">Term</button>
        </td>
      </tr>
      <tr v-if="jobs.length === 0">
        <td colspan="6" class="text-center">
          <h5 class="p-3">No Jobs</h5>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import {JobApi, JobResponse} from "@/services/api/v1/jobApi";
import {defineComponent} from "vue";
import moment from 'moment';

const jobApi = new JobApi();

interface JobData {
  jobs: JobResponse[];
}

export default defineComponent({
  data(): JobData {
    return {
      jobs: []
    };
  },
  methods: {
    term(pid: number) {
      jobApi.term(pid)
    }
  },
  created() {
    jobApi.fetch().then(result => {
      this.jobs = result.data.map((job: JobResponse) => {
        job.createdAt = moment(job.createdAt).fromNow();
        return job;
      });
    }).catch(err => console.log(err));
  }
});
</script>

<style scoped>

</style>
