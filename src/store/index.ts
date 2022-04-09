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
  jobId: number;
  channelName: string;
  filename: string;
  type: string;
  data: { packets: number, frame: number } | any;
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
    'job:destroy'(state: State, data: JobMessage) {
      const i = state.jobs.findIndex(j => j.filename === data.channelName);
      if (i !== -1) {
        state.jobs.splice(i, 1);
      }
    },
    'job:start'(state: State, job: JobMessage) {
      let i = state.jobs.findIndex(j => j.jobId === job.jobId);
      if (i === -1) {
        i = state.jobs.push({
          jobId: job.jobId,
          active: false,
          progress: '0',
          channelName: job.channelName,
          filename: job.filename,
          status: job.type,
          createdAt: new Date().toString(),
          args: ''
        });
      }
      state.jobs[i].active = true;
    },
    'job:progress'(state: State, job: JobMessage) {
      const i = state.jobs.findIndex(j => j.jobId === job.jobId);
      state.jobs[i].progress = String(job.data.frame / job.data.packets * 100);
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
