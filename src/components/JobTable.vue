<template>
  <div class="table-responsive">
    <table class="table table-sm bg-white table-bordered">
      <thead class="bg-light">
      <tr>
        <th class="bg-light p-2" style="width: 5%">{{ t('jobTable.col.pid') }}</th>
        <th class="bg-light p-2" style="width: 10%">{{ t('jobTable.col.channel') }}</th>
        <th class="bg-light p-2 align-bottom" style="width: 10%">{{ t('jobTable.col.file') }}</th>
        <th class="bg-light p-2 align-bottom d-none d-lg-table-cell" style="width: 5%">{{ t('jobTable.col.task') }}</th>
        <th class="bg-light p-2 align-bottom d-none d-lg-table-cell" style="width: 5%">{{
            t('jobTable.col.status')
          }}
        </th>
        <th class="bg-light p-2 align-bottom" style="width:20%">Command</th>
        <th class="bg-light p-2 align-bottom" style="width:10%">{{ t('jobTable.col.progress') }}</th>
        <th class="bg-light p-2 align-bottom" style="width:10%">{{ t('jobTable.col.created') }}</th>
        <th class="bg-light p-2 align-bottom" style="width:5%">{{ t('jobTable.col.destroy') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr class="align-top" :key="i" v-for="(job, i) in props.jobs" :class="{'table-success': job.active}">
        <td class="text-end p-2">
          <div v-if="job.active" style="width: 1rem; height: 1rem" class="spinner-border text-success" role="status">
            <span class="visually-hidden">{{ t('jobTable.loading') }}</span>
          </div>
          {{ job.pid }}
        </td>
        <td class="p-2">
          <RouterLink :to="`/channel/${job.channelId}/${job.channelName}`">
            {{ job.channelName }}
          </RouterLink>
        </td>
        <td class="p-2">
          <RouterLink :to="'/recordings/' + job.recordingId">
            {{ job.filename }}
          </RouterLink>
        </td>

        <td class="p-1">
          <span class="text-capitalize">{{ job.task }}</span>
        </td>
        <td class="p-1">
          <span class="text-capitalize badge p-2" :class="{'bg-primary': job.status===DatabaseJobStatus.StatusOpen, 'bg-primary blink': job.active, 'bg-success': job.status===DatabaseJobStatus.StatusJobCompleted, 'bg-warning': job.status===DatabaseJobStatus.StatusJobCanceled, 'bg-danger' : job.status===DatabaseJobStatus.StatusError}">
            <span v-if="job.status===DatabaseJobStatus.StatusOpen && job.active">Working</span>
            <span v-else>{{ job.status }}</span>
          </span>
        </td>
        <td class="p-1">
          <div class="bg-light border rounded-2 px-2" style="height: 4rem; overflow-y: scroll">
            <code class="p-0" style="font-size: 0.7rem">{{ job.command }}</code>
          </div>
        </td>
        <td class="p-1">
          <div v-if="job.active" class="progress">
            <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" :style="'width:'+ job.progress + '%'" :aria-valuenow="job.progress" aria-valuemin="0" :aria-valuemax="100"></div>
          </div>
          <div>
            {{ job.info }}
          </div>
        </td>
        <td class="p-2">{{ job.fromNow }}</td>
        <td class="p-2">
          <div class="btn-group-sm btn-group w-100">
            <button class="btn btn-outline-danger btn-sm" @click="emit('destroy', job.jobId)">Destroy</button>
          </div>
        </td>
      </tr>

      <tr v-if="jobs.length === 0">
        <td colspan="9" class="text-center">
          <p class="m-0">{{ t('jobTable.noJobs') }}</p>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import { JobTableItem } from "../views/JobView.vue";
import { useI18n } from 'vue-i18n'
import { DatabaseJobStatus } from "../services/api/v1/StreamSinkClient.ts";

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'destroy', value: number): void
  (e: 'info', value: number): void
}>();

const props = defineProps<{
  jobs: JobTableItem[];
}>();
</script>

<style scoped>
</style>