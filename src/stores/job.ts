import { type DatabaseJob as Job, DatabaseJobOrder } from "../services/api/v1/StreamSinkClient";
import { DatabaseJobStatus } from "../services/api/v1/StreamSinkClient";
import { defineStore } from "pinia";
import { createClient } from "../services/api/v1/ClientFactory";

export type JobMessage<T> = {
  data: T;
  job: Job;
};

export type JobState = {
  jobs: Job[];
  jobsCount: number;
};

export type TaskInfo = {
  steps: number;
  step: number;
  pid: number;
  command: string;
  message: string;
};

export type TaskComplete = {
  steps: number;
  step: number;
  message: string;
};

export type TaskProgress = {
  current: number;
  total: number;
  steps: number;
  step: number;
  message: string;
};

export const useJobStore = defineStore("job", {
  state(): JobState {
    return {
      jobs: [],
      jobsCount: 0,
    };
  },
  getters: {
    all: (state: JobState): Job[] => {
      return state.jobs || [];
    },
    open: (state: JobState): Job[] => {
      return (state.jobs || []).filter((x: Job) => x.status === DatabaseJobStatus.StatusJobOpen);
    },
    // A little function acrobatics: getters are treated as functions and immediately called.
    isProcessing: (state: JobState): ((recordingId: number) => string | null) => {
      return (recordingId: number) => state.jobs.find((job: Job) => job.recordingId === recordingId)?.task || null;
    },
  },
  actions: {
    async load() {
      const client = createClient();

      const response = await client.jobs.listCreate({
        skip: 0,
        take: 100,
        states: [DatabaseJobStatus.StatusJobOpen],
        sortOrder: DatabaseJobOrder.JobOrderASC,
      });

      if (response.jobs) {
        this.jobs = response.jobs;
        this.jobsCount = response.totalCount; // Not the number of returned items, the total number in the database.
      }
    },
    add(job: Job) {
      this.jobs.push(job);
      this.jobsCount += 1;
    },
    dec() {
      this.jobsCount = Math.max(this.jobsCount - 1, 0);
    },
    destroyChannel(channelId: number) {
      if (this.jobs.some((job: Job) => job.channelId === channelId)) {
        this.jobs = this.jobs.filter((x: Job) => x.channelId !== channelId);
      }
    },
    destroy(jobId: number) {
      const index = this.jobs.findIndex((x: Job) => x.jobId === jobId);
      if (index !== -1) {
        this.jobs.splice(index, 1);
      }
    },
    done(message: JobMessage<TaskComplete>) {
      this.destroy(message.job.jobId);
      this.dec();
    },
    inactive(job: Job) {
      const i = this.jobs.findIndex((j: Job) => j.jobId === job.jobId);
      if (i !== -1) {
        this.jobs[i] = { ...this.jobs[i], active: false };
      }
    },
    progress(message: JobMessage<TaskProgress>) {
      const i = this.jobs.findIndex((j: Job) => j.jobId === message.job.jobId);
      const progress = String((((message.data.step / message.data.steps) * message.data.current) / message.data.total) * 100);

      if (i !== -1) {
        this.jobs[i] = { ...this.jobs[i], progress, info: message.data.message };
      } else {
        this.jobs.unshift({ ...message.job, progress, info: message.data.message });
      }
    },
    refresh(data: { jobs: Job[]; totalCount: number }) {
      this.jobs = [...data.jobs];
      this.jobsCount = data.totalCount;
    },
    start(message: JobMessage<TaskInfo>) {
      let i = this.jobs.findIndex((j: Job) => j.jobId === message.job.jobId);

      if (i === -1) {
        this.jobs.unshift(message.job);
        i = 0;
      }

      this.jobs[i] = {
        ...this.jobs[i],
        active: true,
        pid: message.data.pid,
        command: message.data.command,
      };
    },
  },
});
