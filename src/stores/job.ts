import type { DatabaseJob as Job } from "../services/api/v1/StreamSinkClient";
import { DatabaseJobStatus } from "../services/api/v1/StreamSinkClient";
import { defineStore } from "pinia";

export const useJobStore = defineStore("job", {
  state(): JobState {
    return {
      jobs: [],
      jobsCount: 0,
    };
  },
  getters: {
    getJobs(): Job[] {
      return this.jobs || [];
    },
    getOpen(): Job[] {
      return (this.jobs || []).filter((x: Job) => x.status === DatabaseJobStatus.StatusJobOpen);
    },
    isProcessing(): (recordingId: number) => string | null {
      return (recordingId: number) => {
        return this.jobs.find((job: Job) => job.recordingId === recordingId)?.task || null;
      };
    },
  },
  actions: {
    create(job: Job) {
      this.jobs.push(job);
      this.jobsCount += 1;
    },
    dec() {
      this.jobsCount = Math.max(this.jobsCount - 1, 0);
    },
    deleteChannel(channelId: number) {
      this.jobs = this.jobs.filter((x: Job) => x.channelId !== channelId);
    },
    deleteRecording(recordingId: number) {
      this.jobs = this.jobs.filter((x: Job) => x.recordingId !== recordingId);
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
