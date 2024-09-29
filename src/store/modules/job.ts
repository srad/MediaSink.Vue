import { DatabaseJob as JobData, DatabaseJob, DatabaseJobOrder, DatabaseJobStatus } from '../../services/api/v1/StreamSinkClient.ts';
import { Module } from 'vuex';
import { createClient } from '../../services/api/v1/ClientFactory.ts';
import { State } from '../index.ts';

export interface TaskInfo {
  job: DatabaseJob;
  data: {
    steps: number
    step: number
    pid: number
    command: string
    message: string
  };
}

export interface TaskProgress {
  job: DatabaseJob;
  data: { current: number, total: number, steps: number, step: number, message: string };
}

export interface JobState {
  jobs: JobData[];
  jobsCount: number;
}

export const JobAction = {
  Load: 'job/load',
  Create: 'job/create',
  Done: 'job/done',
};

const _action = {
  Load: 'load',
  Create: 'create',
  Done: 'done',
};

const _mutation = {
  Create: 'create',
  Start: 'start',
  Inactive: 'inactive',
  Done: 'done',
  Dec: 'dec',
  Update: 'update',
  Delete: 'delete',
  Progress: 'progress',
  Refresh: 'refresh',
  DeleteChannel: 'deleteChannel',
  DeleteRecording: 'deleteRecording',
};

export const JobMutation = {
  Create: 'job/create',
  Start: 'job/start',
  Inactive: 'job/inactive',
  Dec: 'job/dec',
  Done: 'job/done',
  Update: 'job/update',
  Delete: 'job/delete',
  Progress: 'job/progress',
  Refresh: 'job/refresh',
  DeleteChannel: 'job/deleteChannel',
  DeleteRecording: 'job/deleteRecording',
};

export const module: Module<JobState, State> = {
  namespaced: true,
  state(): JobState {
    return {
      jobs: [],
      jobsCount: 0,
    };
  },
  getters: {
    getJobs(state: JobState): JobData[] {
      return state.jobs || [];
    },
    getOpen(state: JobState): JobData[] {
      return (state.jobs || []).filter(x => x.status === DatabaseJobStatus.StatusJobOpen);
    }
  },
  actions: {
    [_action.Done]({ commit }, job: JobData) {
      commit(_mutation.Delete, job.jobId);
      commit(_mutation.Dec);
    },
    [_action.Create]({ commit }, job) {
      commit(_mutation.Create, job);
    },
    // Just load 100 jobs for the initial state.
    async [_action.Load]({ commit }) {
      const api = createClient();
      const res = await api.jobs.listCreate({ skip: 0, take: 100, states: [DatabaseJobStatus.StatusJobOpen], sortOrder: DatabaseJobOrder.JobOrderASC });
      commit(_mutation.Update, { jobs: res.data.jobs || [], totalCount: res.data.totalCount });
    }
  },
  mutations: {
    // [_mutation.Done](state: JobState, job: DatabaseJob) {
    //   const i = state.jobs.findIndex(j => j.jobId === job.jobId);
    //   if (i !== -1) {
    //     state.jobs[i].active = false;
    //     state.jobs[i].status = DatabaseJobStatus.StatusJobCompleted;
    //     state.jobs[i].progress = String(100);
    //   }
    // },
    [_mutation.Dec](state: JobState) {
      state.jobsCount = Math.max(state.jobsCount - 1, 0);
    },
    [_mutation.Update](state: JobState, data: { jobs: JobData[], totalCount: number }) {
      state.jobs = data.jobs;
      state.jobsCount = data.totalCount;
    },
    [_mutation.Create](state: JobState, job: DatabaseJob) {
      state.jobs.push(job);
      state.jobsCount += 1;
    },
    [_mutation.Inactive](state: JobState, progress: TaskProgress) {
      const i = state.jobs.findIndex(j => j.recordingId === progress.job.recordingId);
      if (i !== -1) {
        state.jobs[i].status = progress.job.status;
        state.jobs[i].active = false;
      }
    },
    [_mutation.Start](state: JobState, info: TaskInfo) {
      let i = state.jobs.findIndex(j => j.jobId === info.job.jobId);
      if (i === -1) {
        state.jobs.unshift(info.job);
        i = 0;
      }
      state.jobs[i].active = true;
      state.jobs[i].pid = info.data.pid;
      state.jobs[i].command = info.data.command;
    },
    [_mutation.Progress](state: JobState, info: TaskProgress) {
      const i = state.jobs.findIndex(j => j.jobId === info.job.jobId);
      const progress = String((info.data.step / info.data.steps) * info.data.current / info.data.total * 100);
      if (i !== -1) {
        state.jobs[i].progress = progress;
        state.jobs[i].info = info.data.message;
      } else {
        state.jobs.unshift(info.job);
        state.jobs[0].progress = progress;
        state.jobs[0].info = info.data.message;
      }
    },
    [_mutation.Refresh](state: JobState, data: { jobs: JobData[], totalCount: number }) {
      state.jobs = data.jobs;
      state.jobsCount = data.totalCount;
    },
    [_mutation.Delete](state: JobState, jobId: number) {
      state.jobs = state.jobs.filter(x => x.jobId !== jobId);
    },
    [_mutation.DeleteChannel](state: JobState, channelId: number) {
      state.jobs = state.jobs.filter(x => x.channelId !== channelId);
    },
    [_mutation.DeleteRecording](state: JobState, recordingId: number) {
      state.jobs = state.jobs.filter(x => x.recordingId !== recordingId);
    }
  }
};
