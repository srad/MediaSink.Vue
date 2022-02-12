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
