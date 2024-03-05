<template>
  <ul class="nav nav-tabs my-2" id="pills-tab" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
        {{ $t("job.tab.workerJobs") }}
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
        {{ $t("job.tab.recordings") }}
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createClient } from "@/services/api/v1/ClientFactory";
import moment from 'moment';
import JobTable from '@/components/JobTable.vue';
import { AxiosError } from 'axios';
import { DatabaseRecording as JobResponse } from "@/services/api/v1/StreamSinkClient";

const api = createClient();

export default defineComponent({
  components: { JobTable },
  computed: {
    //@ts-ignore
    recordings() {
      //@ts-ignore
      return this.$store.state.jobs.filter(job => job.status === 'recording').map(job => {
        job.createdAt = moment(job.createdAt).fromNow();
        return job;
      });
    },
    workerJobs(): JobResponse[] {
      //@ts-ignore
      return this.$store.state.jobs.filter(job => job.status !== 'recording').map(job => {
        job.createdAt = moment(job.createdAt).fromNow();
        return job;
      });
    }
  },
  data() {
    return {};
  },
  methods: {
    destroy(id: number) {
      api.jobs.jobsDelete(id)
          .then(() => this.$store.commit('destroyJob', id))
          .catch((err: AxiosError) => alert(err.response?.data));
    }
  },
});
</script>

<style scoped>

</style>
