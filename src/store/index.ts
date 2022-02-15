import { InjectionKey } from 'vue';
import { createStore, Store } from 'vuex';
import { ChannelResponse } from '@/services/api/v1/channelApi';

export interface State {
  channels: ChannelResponse[];
  loggedIn: boolean;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    channels: [],
    loggedIn: false,
  },
  mutations: {
    online(state: State, channelName: string) {
      const i = state.channels.findIndex(ch => ch.channelName === channelName);
      state.channels[i].isOnline = true;
    },
    offline(state: State, channelName: string) {
      const i = state.channels.findIndex(ch => ch.channelName === channelName);
      state.channels[i].isOnline = false;
      state.channels[i].isRecording = false;
    },
    thumbnail(state: State, channelName: string) {
      const i = state.channels.findIndex(ch => ch.channelName === channelName);
      state.channels[i].previewUpdate = new Date();
    },
    start(state: State, channelName: string) {
      const i = state.channels.findIndex(ch => ch.channelName === channelName);
      state.channels[i].isRecording = true;
      state.channels[i].isOnline = true;
    },
    destroyJob(state: State, channelName: string) {
      console.log('TODO: implement destroyJob');
    },
    login(state: State) {
      state.loggedIn = true;
    },
    logout(state: State) {
      state.loggedIn = true;
    },
    addChannel(state: State, channel: ChannelResponse) {
      if (!state.channels.some(c => c.channelName === channel.channelName)) {
        state.channels.push(channel);
      }
    },
    destroyChannel(state: State, channel: ChannelResponse) {
      for (let i = 0; i < state.channels.length; i += 1) {
        if (state.channels[i].channelName === channel.channelName) {
          state.channels.splice(i, 1);
          break;
        }
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
