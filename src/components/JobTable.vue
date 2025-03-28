<template>
  <div class="table-responsive">
    <!-- DataTable Component -->
    <DataTable :columns="columns" :data="props.jobs as unknown as TableRow[]" :pageSize="pageSize" :showPagination="true" :showPageSizeSelector="true" @page-change="handlePageChange" @page-size-change="handlePageSizeChange">
      <template v-slot:cell-pid="{ value, row }">
        <div v-if="row.active" style="width: 1rem; height: 1rem" class="spinner-border text-success" role="status">
          <span class="visually-hidden">{{ t("jobTable.loading") }}</span>
        </div>
        {{ value }}
      </template>

      <template #cell-channelName="{ value, row }">
        <div class="d-flex gap-1 justify-content-between fs-6">
          <RouterLink :to="`/channel/${row.channelId}/${row.channelName}`">
            {{ value }}
          </RouterLink>
          <RouterLink :to="'/recordings/' + row.recordingId">
            <i class="bi bi-film"></i>
          </RouterLink>
        </div>
      </template>

      <!--
      <template v-slot:cell-status="{ value, row }">
        <div class="badge p-2 w-100" :class="getStatusClass(row)">
          <span v-if="row.status === DatabaseJobStatus.StatusJobOpen && row.active">working</span>
          <span v-else>{{ value }}</span>
        </div>
      </template>
      -->

      <template v-slot:cell-command="{ value }">
        <input type="text" class="form-control form-control-sm border-primary-subtle" style="font-size: 0.8rem; font-family: monospace" disabled :value="value" />
      </template>

      <template v-slot:cell-progress="{ row }">
        <div v-if="row.active" class="progress">
          <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" :style="'width:' + row.progress + '%'" :aria-valuenow="(row as unknown as JobTableItem).progress || 0" aria-valuemin="0" :aria-valuemax="100"></div>
        </div>
      </template>

      <template v-slot:cell-createdAt="{ value }">
        {{ value }}
      </template>

      <template v-slot:cell-destroy="{ row }">
        <div class="btn-group-sm btn-group w-100">
          <button class="btn btn-outline-danger btn-sm" @click="emit('destroy', (row as unknown as JobTableItem).jobId)">Destroy</button>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { type DatabaseJob, DatabaseJobStatus } from "../services/api/v1/StreamSinkClient";
import { useI18n } from "vue-i18n";
import DataTable from "./DataTable.vue";
import type { Column, TableRow } from "./DataTable.vue";

export type JobTableItem = DatabaseJob & {
  createdAtFromNow: string;
  startedFromNow?: string;
  completedAtFromNow?: string;
};

const { t } = useI18n();

const emit = defineEmits<{
  (e: "destroy", value: number): void;
}>();

const props = defineProps<{
  jobs: JobTableItem[];
  totalCount: number;
  showProgress: boolean;
  showInfo?: boolean;
}>();

const pageSize = 10; // Adjust as needed

// Define columns with width properties
const columns: Column[] = [
  { key: "pid", label: t("jobTable.col.pid"), width: "7%" },
  { key: "channelName", label: t("jobTable.col.channel"), sortable: true, type: "string", width: "7%" },
  //{ key: "filename", label: t("jobTable.col.file"), sortable: true, type: "string", width: "5%" },
  { key: "task", label: t("jobTable.col.task"), sortable: true, type: "string", width: "10%", class: "d-none d-lg-table-cell" },
  //{ key: "status", label: t("jobTable.col.status"), sortable: true, type: "string", width: "5%", class: "d-none d-lg-table-cell" },
  { key: "command", label: "Command", sortable: false, type: "string", width: "15%", class: "d-none d-lg-table-cell" },
  { key: "progress", label: t("jobTable.col.progress"), sortable: false, type: "string", width: "10%" },
  { key: "createdAtFromNow", label: t("jobTable.col.createdAt"), sortable: false, type: "string", width: "10%" },
  { key: "startedFromNow", label: t("jobTable.col.startedAt"), sortable: false, type: "string", width: "10%" },
  { key: "completedAtFromNow", label: t("jobTable.col.completedAt"), sortable: false, type: "string", width: "10%" },
  { key: "destroy", label: t("jobTable.col.destroy"), sortable: false, type: "string", width: "5%" },
];

const getStatusClass = (row: JobTableItem) => {
  switch (row.status) {
    case DatabaseJobStatus.StatusJobOpen:
      return "bg-primary";
    case DatabaseJobStatus.StatusJobCompleted:
      return "bg-success";
    case DatabaseJobStatus.StatusJobError:
      return "bg-danger";
    case DatabaseJobStatus.StatusJobCanceled:
      return "bg-warning";
    default:
      return "bg-secondary";
  }
};

// Handlers for pagination events
const handlePageChange = (page: number) => {
  // Handle page change logic here
};

const handlePageSizeChange = (size: number) => {
  // Handle page size change logic here
};
</script>

<style scoped>
.job-table * {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.job-table th {
  font-size: 0.9rem;
}
</style>
