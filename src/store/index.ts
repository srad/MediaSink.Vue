import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { V1ChannelResponse, DatabaseJob as JobResponse, DatabaseJob } from '@/services/api/v1/StreamSinkClient';

export interface ChannelResponse extends V1ChannelResponse {
  previewUpdate: Date;
}

export interface State {
  channels: ChannelResponse[];
  jobs: JobResponse[];
  loggedIn: boolean;
}

export interface JobMessage {
  jobId: number;
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
  state() {
    return {
      channels: [],
      jobs: [],
      loggedIn: false,
    };
  },
  mutations: {
    'job:preview:done'(state: State, data: JobMessage) {
      console.log('Job done', data);
    },
    'job:preview:progress'(state: State, data) {
      console.log('Progrss: ', data);
    },
    'job:create'(state: State, data: DatabaseJob) {
      state.jobs.push(data);
    },
    'job:destroy'(state: State, data: JobMessage) {
      const i = state.jobs.findIndex(j => j.filename === data.channelName);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
    },
    'job:start'(state: State, job: DatabaseJob) {
      let i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i === -1) {
        i = state.jobs.push(job);
      }
      state.jobs[i].active = true;
    },
    'job:progress'(state: State, job: JobMessage) {
      console.log(job);
      const i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i !== -1) {
        state.jobs[i].progress = String(job.data.frame / job.data.packets * 100);
      }
    },
    'channel:online'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      if (i !== -1) {
        state.channels[i].isOnline = true;
      }
    },
    'channel:offline'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      if (i !== -1) {
        state.channels[i].isOnline = false;
        state.channels[i].isRecording = false;
      }
    },
    'channel:thumbnail'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      if (i !== -1) {
        state.channels[i].previewUpdate = new Date();
      }
    },
    'channel:start'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
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
      if (!state.channels.some(c => c.channelName === channel.channelName)) {
        state.channels.push(channel);
      }
    },
    updateChannel(state: State, channel: ChannelResponse) {
      const i = state.channels.findIndex(c => c.channelName === channel.channelName);
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
    destroyChannel(state: State, channel: ChannelResponse) {
      const i = state.channels.findIndex(c => c.channelName === channel.channelName);
      if (i !== -1) {
        state.channels.splice(i, 1);
      }
    },
    pauseChannel(state: State, data: { channel: ChannelResponse, pause: boolean }) {
      const i = state.channels.findIndex(c => c.channelName === data.channel.channelName);
      if (i !== -1) {
        state.channels[i].isPaused = data.pause;
      }
    },
    destroyJob(state: State, jobId: number) {
      const i = state.jobs.findIndex(j => j.jobId === jobId);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
    },
    fav(state: State, channel: ChannelResponse) {
      const i = state.channels.findIndex(ch => ch.channelName === channel.channelName);
      state.channels[i].fav = true;
    },
    unfav(state: State, channel: ChannelResponse) {
      const i = state.channels.findIndex(ch => ch.channelName === channel.channelName);
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

export function useStore() {
  return baseUseStore(key);
}
