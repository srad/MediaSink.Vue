<template>
  <div class="table-responsive" style="width: 99.9%">
    <table class="table table-sm shadow-sm align-middle bg-white table-bordered table-hover">
      <thead class="bg-light">
      <tr>
        <th style="width: 20px">{{ $t("jobTable.col.pid") }}</th>
        <th style="width: 50px">{{ $t("jobTable.col.channel") }}</th>
        <th class="align-bottom" style="width: 50px">{{ $t("jobTable.col.file") }}</th>
        <th class="align-bottom d-none d-lg-table-cell" style="width: 60px">{{ $t("jobTable.col.task") }}</th>
        <th class="align-bottom" style="width:70px">{{ $t("jobTable.col.progress") }}</th>
        <th class="align-bottom" style="width:110px">{{ $t("jobTable.col.created") }}</th>
        <th class="align-bottom" style="width:50px">{{ $t("jobTable.col.destroy") }}</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="i" v-for="(job, i) in jobs" :class="{'table-success': job.active}">
        <td class="text-end">
          <div v-if="job.active" style="width: 1rem; height: 1rem" class="spinner-border text-success" role="status">
            <span class="visually-hidden">{{ $t("jobTable.loading") }}</span>
          </div>
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
        <td class="p-1">
          <div class="btn-group-sm btn-group w-100">
            <button class="btn btn-outline-danger btn-sm" @click="$emit('destroy', job.jobId)">Destroy</button>
            <button class="btn btn-outline-info btn-sm" @click="$emit('info', job.jobId)">Info</button>
          </div>
        </td>
      </tr>

      <tr v-if="jobs.length === 0">
        <td colspan="7" class="text-center">
          <h5 class="p-3">{{ $t("jobTable.noJobs") }}</h5>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'JobTable',
  emits: ['destroy'],
  props: {
    jobs: { type: Array, required: true },
  }
});
</script>

<style scoped>

</style>
