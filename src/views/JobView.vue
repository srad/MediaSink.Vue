<template>
  <div>
    <ModalConfirmDialog :show="showConfirmToggleWorkerDialog" @cancel="showConfirmToggleWorkerDialog = false" @confirm="toggleWorker">
      <template v-slot:header>
        <div class="d-flex justify-content-between">
          <h5 class="modal-title">
            <span v-if="processingJobs">Pause job worker?</span>
            <span v-else>Resume job worker?</span>
          </h5>
        </div>
      </template>
      <template v-slot:body>
        <span v-if="processingJobs"> Do you want to pause the job worker? </span>
        <span v-else> Do you want to resume the job worker? </span>
      </template>
    </ModalConfirmDialog>
    <div class="row mb-2">
      <div class="col">
        <div class="d-flex justify-content-between">
          <div class="d-flex">
            <select class="form-control form-select" v-model="tab">
              <option class="fw-bold" disabled readonly value="">Job types</option>
              <option v-for="tab in tabs" :value="tab.key" :key="tab.key">
                {{ tab.value }}
              </option>
            </select>
          </div>

          <div class="d-flex justify-content-center">
            <div class="col-auto">
              <button type="button" class="btn me-2" :class="{ 'btn-success': !processingJobs, 'btn-danger': processingJobs }" @click="showConfirmToggleWorkerDialog = true">
                <span v-if="processingJobs"><i class="bi bi-pause-fill blink" /> <span class="ms-1 d-none d-sm-inline-flex">Pause</span></span>
                <span v-else><i class="bi bi-play-fill" /> <span class="ms-1 d-none d-sm-inline-flex">Resume</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DataTable v-if="tab === 'processes'" :columns="processesCols" :data="processes">
      <template #cell-args="{ value }">
        <textarea disabled readonly class="form-control" v-model="value as string" />
      </template>
    </DataTable>
    <JobTable v-else :jobs="jobs" @destroy="destroy" :total-count="jobs.length" :show-progress="true" />
  </div>
</template>

<script setup lang="ts">
import { type DatabaseJob, DatabaseJobOrder, DatabaseJobStatus, type ServicesProcessInfo } from "@/services/api/v1/StreamSinkClient";
import { useJobStore } from "@/stores/job";
import ModalConfirmDialog from "@/components/modals/ModalConfirmDialog.vue";
import { onMounted, ref, watch } from "vue";
import JobTable, { type JobTableItem } from "@/components/JobTable.vue";
import { useRoute, useRouter } from "vue-router";
import { createClient } from "@/services/api/v1/ClientFactory";
import { fromNow } from "@/utils/datetime.ts";
import DataTable, { type Column } from "@/components/DataTable.vue";

const jobStore = useJobStore();
const route = useRoute();
const router = useRouter();
const processingJobs = ref(true);
const showConfirmToggleWorkerDialog = ref(false);
const tab = ref<JobType>(route.params.tab as JobType);

const processesCols: Column[] = [
  { label: "PID", key: "pid", width: "10%" },
  { label: "Path", key: "path", width: "20%" },
  { label: "Args", key: "args", width: "width: 70%" },
];

const processes = ref<ServicesProcessInfo[]>([]);

const tabs: { key: JobType; value: string }[] = [
  { key: "open", value: "Open" },
  { key: "completed", value: "Completed" },
  { key: "canceled", value: "Canceled" },
  { key: "error", value: "Errors" },
  { key: "processes", value: "Processes" },
];

watch(tab, (tab: JobType) => {
  router.push(`/jobs/${tab}`);
});

type JobType = "open" | "completed" | "canceled" | "error" | "processes";

const tabToJobType: { [key: string]: DatabaseJobStatus } = {
  open: DatabaseJobStatus.StatusJobOpen,
  completed: DatabaseJobStatus.StatusJobCompleted,
  canceled: DatabaseJobStatus.StatusJobCanceled,
  processes: DatabaseJobStatus.StatusJobError,
};

const jobs = ref<JobTableItem[]>([]);

onMounted(async () => {
  await load();
});

const load = async () => {
  const client = createClient();

  if (tab.value === "open" || tab.value === "completed" || tab.value === "canceled" || tab.value === "error") {
    const result = await client.jobs.listCreate({
      states: [tabToJobType[tab.value]],
      sortOrder: DatabaseJobOrder.JobOrderDESC,
      take: 100,
    });
    if (result.jobs) {
      jobs.value = result.jobs.map((job: DatabaseJob) => ({
        ...job,
        createdAtFromNow: fromNow(Date.parse(job.createdAt)),
        startedFromNow: job.startedAt ? fromNow(Date.parse(job.startedAt)) : "-",
        completedAtFromNow: job.completedAt ? fromNow(Date.parse(job.completedAt)) : "-",
      }));
    }
  } else if (tab.value === "processes") {
    processes.value = await client.processes.processesList();
  }
};

const destroy = (id: number) => {
  if (window.confirm("Delete?")) {
    const client = createClient();
    client.jobs
      .jobsDelete(id)
      .then(() => jobStore.destroy(id))
      .catch((res) => alert(res));
  }
};

const toggleWorker = () => {
  const client = createClient();
  const fn = processingJobs.value ? client.jobs.pauseCreate : client.jobs.resumeCreate;

  fn()
    .then(() => {
      processingJobs.value = !processingJobs.value;
    })
    .catch((res) => alert((<{ error: string }>res).error))
    .finally(() => (showConfirmToggleWorkerDialog.value = false));
};
</script>
