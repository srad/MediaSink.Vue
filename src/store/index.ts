import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { DatabaseJob as JobData, DatabaseJob, DatabaseJobStatus, RequestsAuthenticationRequest, ServicesChannelInfo as ChannelInfo } from '../services/api/v1/StreamSinkClient';
import AuthService, { AuthHeader } from "../services/auth.service.ts";

export interface State {
  channels: ChannelInfo[];
  jobs: JobData[];
  toasts: Toast[];
  loggedIn: boolean;
}

export interface TaskInfo {
  job: DatabaseJob
  data: {
    steps: number
    step: number
    pid: number
    command: string
    message: string
  }
}

export interface TaskProgress {
  job: DatabaseJob
  data: { current: number, total: number, steps: number, step: number, message: string };
}

export interface Toast {
  title: string;
  message: string;
  hide: boolean;
  created: Date;
  countdown: number;
}

interface AuthState {
  status: {
    loggedIn: boolean;
  };
  user: AuthHeader | null;
}

export const key: InjectionKey<Store<State>> = Symbol();

// User initial state.
const token = AuthService.getToken();

//--------------------------------------------------------------------
//                 !!! Mutations must be synchronous !!!
//--------------------------------------------------------------------

export const store = createStore<State>({
  state: {
    channels: [],
    jobs: [],
    loggedIn: token !== null,
    toasts: [],
  },
  getters: {
    getToast(state: State): Toast[] {
      return state.toasts;
    },
    openJobsCount(state: State): number {
      return state.jobs.length;
    },
    openJobs(state: State): JobData[] {
      return state.jobs.filter(x => x.status === DatabaseJobStatus.StatusOpen).sort((a, b) => a.jobId - b.jobId);
    },
    nonOpenJobs(state: State): JobData[] {
      return state.jobs.filter(x => x.status !== DatabaseJobStatus.StatusOpen)
    },
    isLoggedIn(state: State): boolean {
      return state.loggedIn;
    }
  },
  actions: {
    login({ commit }, user: RequestsAuthenticationRequest) {
      return AuthService.login(user).then(token => {
        commit('loginSuccess');
        return Promise.resolve(token);
      }).catch((error: any) => {
        commit('loginFailure');
        return Promise.reject(error);
      });
    },
    logout({ commit }) {
      AuthService.logout();
      commit('logout');
    },
    register({ commit }, user) {
      return AuthService.signup(user).then(response => {
        commit('registerSuccess');
        return Promise.resolve(response.data);
      }).catch(error => {
        commit('registerFailure');
        return Promise.reject(error);
      });
    },
    error({ commit }, message: string) {
      commit('toast:add', { title: 'Error', message: message });
    },
  },
  mutations: {
    loginSuccess(state) {
      state.loggedIn = true;
    },
    loginFailure(state) {
      state.loggedIn = false;
    },
    login(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
    },
    registerSuccess(state) {
      state.loggedIn = false;
    },
    registerFailure(state) {
      state.loggedIn = false;
    },
    'job:done'(state: State, job: DatabaseJob) {
      const i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i !== -1) {
        state.jobs[i].active = false;
        state.jobs[i].status = DatabaseJobStatus.StatusJobCompleted;
        state.jobs[i].progress = String(100);
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
    'job:create'(state: State, job: DatabaseJob) {
      state.jobs.push(job);
    },
    'job:destroy'(state: State, progress: TaskProgress) {
      const i = state.jobs.findIndex(j => j.recordingId === progress.job.recordingId);
      if (i !== -1) {
        state.jobs[i].status = progress.job.status;
        state.jobs[i].active = false;
      }
    },
    'job:start'(state: State, info: TaskInfo) {
      let i = state.jobs.findIndex(j => j.jobId === info.job.jobId);
      if (i === -1) {
        state.jobs.unshift(info.job);
        i = 0;
      }
      state.jobs[i].active = true;
      state.jobs[i].pid = info.data.pid;
      state.jobs[i].command = info.data.command;
    },
    'job:deleted'(state: State, id: number) {
      const i = state.jobs.findIndex(c => c.jobId === id);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
    },
    'job:progress'(state: State, info: TaskProgress) {
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