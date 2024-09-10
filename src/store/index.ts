import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { ServicesChannelInfo as ChannelInfo, DatabaseJob as JobData, DatabaseJob } from '../services/api/v1/StreamSinkClient';

export interface State {
  channels: ChannelInfo[];
  jobs: JobData[];
  toasts: Toast[];
  loggedIn: boolean;
}

export interface JobInfo {
  job: DatabaseJob
  data: {
    steps: number
    step: number
    pid: number
    command: string
  }
}

export interface JobProgress {
  job: DatabaseJob
  data: { current: number, total: number, steps: number, step: number };
}

export interface Toast {
  title: string;
  message: string;
  hide: boolean;
  created: Date;
  countdown: number;
}

export const key: InjectionKey<Store<State>> = Symbol();

//--------------------------------------------------------------------
//                 !!! Mutations must be synchronous !!!
//--------------------------------------------------------------------

export const store = createStore<State>({
  state: {
    channels: [],
    jobs: [],
    loggedIn: false,
    toasts: []
  },
  getters: {
    getToast(state: State): Toast[] {
      return state.toasts;
    },
    getRecordingsCount(state: State): number {
      return state.jobs.length;
    },
    getRecordings(state: State): JobData[] {
      return state.jobs
    }
  },
  mutations: {
    error(state: State, message: string) {
      store.commit('toast:add', { title: 'Error', message: message });
    },
    'job:done'(state: State, job: DatabaseJob) {
      const i = state.jobs.findIndex(j => j.jobId === job.jobId);
      console.log("job:done", i, job.jobId);
      if (i !== -1) {
        state.jobs[i].active = false;
        state.jobs[i].progress = String(100);
        state.jobs.splice(i, 1);
      }
    },
    'jobs:update'(state: State, jobs: JobData[]) {
      state.jobs = jobs;
    },
    'toast:add'(state: State, info: { title: string, message: string }) {
      const toast: Toast = { ...info, hide: false, created: new Date(), countdown: 100 };
      const i = state.toasts.push(toast) - 1;

      // The animation can also be implemented with pure CSS, but that free us from this state update logic.
      const toastDisplayDurationMs = 3000;
      const id = setInterval(() => {
        const dtMS = ((new Date()).getTime() - toast.created.getTime());
        state.toasts[i].countdown = 100 - (dtMS / toastDisplayDurationMs * 100);
        if (state.toasts[i].countdown <= 0) {
          clearInterval(id);
          state.toasts[i].hide = true;
        }
      }, toastDisplayDurationMs / 10);
    },
    'toast:destroy'(state: State, toast: Toast) {
      const i = state.toasts.findIndex(x => x === toast);
      if (i !== -1) {
        state.toasts.splice(i, 1);
      }
    },
    'toast:hide'(state: State, toast: Toast) {
      const i = state.toasts.findIndex(x => x === toast);
      if (i !== -1) {
        state.toasts[i].hide = true;
      }
    },
    'job:create'(state: State, job: JobData) {
      state.jobs.push(job);
    },
    'job:destroy'(state: State, progress: JobProgress) {
      const i = state.jobs.findIndex(j => j.recordingId === progress.job.recordingId);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
    },
    'job:start'(state: State, info: JobInfo) {
      let i = state.jobs.findIndex(j => j.jobId === info.job.jobId);
      if (i !== -1) {
        state.jobs[i].active = true;
        state.jobs[i].pid = info.data.pid;
        state.jobs[i].command = info.data.command;
      }
    },
    'job:progress'(state: State, info: JobProgress) {
      const i = state.jobs.findIndex(j => j.jobId === info.job.jobId);
      const progress = String((info.data.step / info.data.steps) * info.data.current / info.data.total * 100);
      if (i !== -1) {
        state.jobs[i].progress = progress;
      } else {
        state.jobs.unshift(info.job);
      }
    },
    'jobs:refresh'(state: State, jobs: JobData[]) {
      state.jobs = jobs;
    },
    'channel:online'(state: State, channelId: number) {
      const i = state.channels.findIndex(ch => ch.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isOnline = true;
      }
    },
    'channel:offline'(state: State, channelId: number) {
      const i = state.channels.findIndex(ch => ch.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isOnline = false;
        state.channels[i].isRecording = false;
      }
    },
    'channel:thumbnail'(state: State, channelId: number) {
      const index = state.channels.findIndex(ch => ch.channelId === channelId);
      if (index !== -1) {
        // Refresh cache with url timestamp update.
        state.channels[index].preview = state.channels[index].preview.split("?")[0] + `?time=${new Date().toISOString()}`;
      }
    },
    'channel:start'(state: State, channelId: number) {
      const i = state.channels.findIndex(ch => ch.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isRecording = true;
        state.channels[i].isOnline = true;
      }
    },
    login(state: State) {
      state.loggedIn = true;
    },
    logout(state: State) {
      state.loggedIn = true;
    },
    addChannel(state: State, channel: ChannelInfo) {
      if (!state.channels.some(c => c.channelId === channel.channelId)) {
        state.channels.push(channel);
      }
    },
    updateChannel(state: State, channel: ChannelInfo) {
      const i = state.channels.findIndex(c => c.channelId === channel.channelId);
      if (i !== -1) {
        const ch = state.channels[i] as ChannelInfo;
        Object
          .keys(channel)
          .forEach(key => {
            //@ts-ignore
            ch[key] = channel[key];
          });
      }
    },
    destroyChannel(state: State, id: number) {
      const i = state.channels.findIndex(c => c.channelId === id);
      if (i !== -1) {
        state.channels.splice(i, 1);
      }
    },
    'channel:pause'(state: State, channelId: number) {
      const i = state.channels.findIndex(c => c.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isRecording = false;
        state.channels[i].isPaused = true;
      }
    },
    'channel:resume'(state: State, channelId: number) {
      const i = state.channels.findIndex(c => c.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isPaused = false;
      }
    },
    destroyJob(state: State, jobId: number) {
      state.jobs = state.jobs.filter(x => x.jobId !== jobId);
    },
    fav(state: State, id: number) {
      const i = state.channels.findIndex(ch => ch.channelId === id);
      state.channels[i].fav = true;
    },
    unfav(state: State, id: number) {
      const i = state.channels.findIndex(ch => ch.channelId === id);
      state.channels[i].fav = false;
    },
    clearChannels(state: State) {
      state.channels = [];
    },
    stopChannels(state: State) {
      for (let i = 0; i < state.channels.length; i += 1) {
        state.channels[i].isRecording = false;
      }
    }
  }
});

export const useStore = function () {
  return baseUseStore(key)
}