import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { V1ChannelResponse as ChannelResponse, ModelsJob as JobResponse } from '../services/api/v1/StreamSinkClient';

export interface State {
  channels: ChannelResponse[];
  jobs: JobResponse[];
  loggedIn: boolean;
}

export interface JobMessage {
  jobId: number;
  channelId: number;
  channelName: string;
  filename: string;
  type: string;
  data: { packets: number, frame: number } | any;
}

export const key: InjectionKey<Store<State>> = Symbol();

///////////////////////////////////////////////////
// Mutations must be synchronous!
///////////////////////////////////////////////////

export const store = createStore<State>({
  state: {
    channels: [],
    jobs: [],
    loggedIn: false,
  },
  mutations: {
    'job:done'(state: State, job: JobMessage) {
      const i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i !== -1) {
        state.jobs[i].active = false;
        state.jobs[i].progress = String(100);
      }
    },
    'job:create'(state: State, data: JobResponse) {
      state.jobs.push(data);
    },
    'job:destroy'(state: State, data: JobMessage) {
      const i = state.jobs.findIndex(j => j.filename === data.filename);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
    },
    'job:start'(state: State, job: JobResponse) {
      let i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i === -1) {
        i = state.jobs.push(job);
      }
      state.jobs[i].active = true;
    },
    'job:progress'(state: State, job: JobMessage) {
      const i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i !== -1) {
        state.jobs[i].progress = String(job.data.frame / job.data.packets * 100);
      }
    },
    'jobs:refresh'(state: State, jobs: JobResponse[]) {
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
    addJob(state: State, job: JobResponse) {
      job.progress = '0';
      state.jobs.push(job);
    },
    addChannel(state: State, channel: ChannelResponse) {
      if (!state.channels.some(c => c.channelId === channel.channelId)) {
        state.channels.push(channel);
      }
    },
    updateChannel(state: State, channel: ChannelResponse) {
      const i = state.channels.findIndex(c => c.channelId === channel.channelId);
      if (i !== -1) {
        const ch = state.channels[i] as ChannelResponse;
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
    'channel:pause'(state: State, data: { id: number, pause: boolean }) {
      const i = state.channels.findIndex(c => c.channelId === data.id);
      if (i !== -1) {
        state.channels[i].isRecording = data.pause;
        state.channels[i].isPaused = data.pause;
      }
    },
    destroyJob(state: State, jobId: number) {
      const i = state.jobs.findIndex(j => j.jobId === jobId);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
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