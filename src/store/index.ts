import { InjectionKey } from 'vue';
import { createStore, Store } from 'vuex';
import { ChannelResponse } from '@/services/api/v1/channelApi';
import { JobResponse } from '@/services/api/v1/jobApi';

export interface State {
  channels: ChannelResponse[];
  jobs: JobResponse[];
  loggedIn: boolean;
}

export interface JobMessage {
  channelName: string;
  filename: string;
  type: string;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    channels: [],
    jobs: [],
    loggedIn: false,
  },
  mutations: {
    'job:preview:done'(state: State, data: JobMessage) {
      console.log('Job done', data);
    },
    'job:preview:progress'(state: State, data) {
      console.log('Progrss: ', data);
    },
    'job:create'(state: State, data: JobMessage) {
      // TODO
      //state.jobs.push({ channelName: data.channelName, filename: data.filename, jobId: 0 });
    },
    'job:destroy'(state: State, data: JobMessage) {
      const i = state.jobs.findIndex(j => j.filename === data.channelName);
      state.jobs.splice(i, 1);
    },
    'channel:online'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      state.channels[i].isOnline = true;
    },
    'channel:offline'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      state.channels[i].isOnline = false;
      state.channels[i].isRecording = false;
    },
    'channel:thumbnail'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      state.channels[i].previewUpdate = new Date();
    },
    'channel:start'(state: State, data: { channelName: string }) {
      const i = state.channels.findIndex(ch => ch.channelName === data.channelName);
      state.channels[i].isRecording = true;
      state.channels[i].isOnline = true;
    },
    login(state: State) {
      state.loggedIn = true;
    },
    logout(state: State) {
      state.loggedIn = true;
    },
    addJob(state: State, job: JobResponse) {
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
        state.channels[i] = channel;
      }
    },
    destroyChannel(state: State, channel: ChannelResponse) {
      const i = state.channels.findIndex(c => c.channelName === channel.channelName);
      if (i !== -1) {
        state.channels.splice(i, 1);
      }
    },
    pauseChannel(state: State, data: { channel: ChannelResponse, pause: boolean }) {
      for (let i = 0; i < state.channels.length; i += 1) {
        if (state.channels[i].channelName === data.channel.channelName) {
          state.channels[i].isPaused = data.pause;
          break;
        }
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
