<template>
  <div class="table-responsive">
    <table class="table table-sm bg-white table-bordered">
      <thead class="bg-light">
      <tr>
        <th class="bg-light p-2" style="width: 20px">{{ $t('jobTable.col.pid') }}</th>
        <th class="bg-light p-2" style="width: 50px">{{ $t('jobTable.col.channel') }}</th>
        <th class="bg-light p-2 align-bottom" style="width: 50px">{{ $t('jobTable.col.file') }}</th>
        <th class="bg-light p-2 align-bottom d-none d-lg-table-cell" style="width: 60px">{{
            $t('jobTable.col.task')
          }}
        </th>
        <th class="bg-light p-2 align-bottom" style="width:70px">{{ $t('jobTable.col.progress') }}</th>
        <th class="bg-light p-2 align-bottom" style="width:110px">{{ $t('jobTable.col.created') }}</th>
        <th class="bg-light p-2 align-bottom" style="width:50px">{{ $t('jobTable.col.destroy') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr class="align-middle" :key="i" v-for="(job, i) in props.jobs" :class="{'table-success': job.active}">
        <td class="text-end p-2">
          <div v-if="job.active" style="width: 1rem; height: 1rem" class="spinner-border text-success" role="status">
            <span class="visually-hidden">{{ $t('jobTable.loading') }}</span>
          </div>
          {{ job.pid }}
        </td>
        <td class="p-1">
          <RouterLink :to="`/stream/${job.channelId}/${job.channelName}`">
            {{ job.channelName }}
          </RouterLink>
        </td>
        <td class="p-1">
          <RouterLink :to="'/recordings/' + job.recordingId">
            {{ job.filename }}
          </RouterLink>
        </td>
        <td class="p-1">{{ job.status }}</td>
        <td class="p-1">
          <div v-if="job.active" class="progress">
            <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" :style="'width:'+ job.progress + '%'" :aria-valuenow="job.progress" aria-valuemin="0" :aria-valuemax="100"></div>
          </div>
        </td>
        <td class="p-1">{{ job.fromNow }}</td>
        <td class="p-1">
          <div class="btn-group-sm btn-group w-100">
            <button class="btn btn-outline-danger btn-sm" @click="emit('destroy', job.jobId)">Destroy</button>
            <button class="btn btn-outline-info btn-sm" @click="emit('info', job.jobId)">Info</button>
          </div>
        </td>
      </tr>

      <tr v-if="jobs.length === 0">
        <td colspan="7" class="text-center">
          <p class="m-0">{{ $t('jobTable.noJobs') }}</p>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { JobTableItem } from "../views/JobView.vue";

const emit = defineEmits<{
  (e: 'destroy', value: number): void
  (e: 'info', value: number): void
}>();

const props = defineProps<{ jobs: JobTableItem[] }>();
</script>

<style scoped>
</style>