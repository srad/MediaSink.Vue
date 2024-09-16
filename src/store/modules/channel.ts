import { RequestsChannelRequest as ChannelRequest, ServicesChannelInfo as ChannelInfo } from '../../services/api/v1/StreamSinkClient.ts';
import { createClient } from '../../services/api/v1/ClientFactory.ts';
import { State } from '../index.ts';
import { Module } from 'vuex';

export interface ChannelState {
  channels: ChannelInfo[];
}

export const ChannelAction = {
  Save: 'channel/save',
};

const _action = {
  Save: 'save',
};

export const ChannelMutation = {
  Online: 'channel/online',
  Offline: 'channel/offline',
  Thumbnail: 'channel/thumbnail',
  Start: 'channel/start',
  Stop: 'channel/stop',
  Add: 'channel/add',
  Update: 'channel/update',
  Destroy: 'channel/destroy',
  Pause: 'channel/pause',
  Resume: 'channel/resume',
  Fav: 'channel/fav',
  Unfav: 'channel/unfav',
  Clear: 'channel/clear',
};

export const _mutation = {
  Online: 'online',
  Offline: 'offline',
  Thumbnail: 'thumbnail',
  Start: 'start',
  Stop: 'stop',
  Add: 'add',
  Update: 'update',
  Destroy: 'destroy',
  Pause: 'pause',
  Resume: 'resume',
  Fav: 'fav',
  Unfav: 'unfav',
  Clear: 'clear',
};

export const module: Module<ChannelState, State> = {
  namespaced: true,
  state: (): ChannelState => ({
    channels: [],
  }),
  actions: {
    [_action.Save]({ commit }, channel: ChannelRequest) {
      return new Promise((resolve, reject) => {
        const api = createClient();
        api.channels.channelsCreate(channel)
          .then(res => {
            commit(_mutation.Add, res.data);
            resolve(res.data);
          })
          .catch(res => reject(res.error));
      });
    }
  },
  mutations: {
    [_mutation.Online](state: ChannelState, channelId: number) {
      const i = state.channels.findIndex(ch => ch.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isOnline = true;
      }
    },
    [_mutation.Offline](state: ChannelState, channelId: number) {
      const i = state.channels.findIndex(ch => ch.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isOnline = false;
        state.channels[i].isRecording = false;
      }
    },
    [_mutation.Thumbnail](state: ChannelState, channelId: number) {
      const index = state.channels.findIndex(ch => ch.channelId === channelId);
      if (index !== -1) {
        // Refresh cache with url timestamp update.
        state.channels[index].preview = state.channels[index].preview.split('?')[0] + `?time=${new Date().toISOString()}`;
      }
    },
    [_mutation.Start](state: ChannelState, channelId: number) {
      const i = state.channels.findIndex(ch => ch.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isRecording = true;
        state.channels[i].isOnline = true;
      }
    },
    [_mutation.Add](state: ChannelState, channel: ChannelInfo) {
      if (!state.channels.some(c => c.channelId === channel.channelId)) {
        state.channels.push(channel);
      }
    },
    [_mutation.Update](state: ChannelState, channel: ChannelInfo) {
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
    [_mutation.Destroy](state: ChannelState, id: number) {
      const i = state.channels.findIndex(c => c.channelId === id);
      if (i !== -1) {
        state.channels.splice(i, 1);
      }
    },
    [_mutation.Pause](state: ChannelState, channelId: number) {
      const i = state.channels.findIndex(c => c.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isRecording = false;
        state.channels[i].isPaused = true;
      }
    },
    [_mutation.Resume](state: ChannelState, channelId: number) {
      const i = state.channels.findIndex(c => c.channelId === channelId);
      if (i !== -1) {
        state.channels[i].isPaused = false;
      }
    },
    [_mutation.Fav](state: ChannelState, id: number) {
      const i = state.channels.findIndex(ch => ch.channelId === id);
      state.channels[i].fav = true;
    },
    [_mutation.Unfav](state: ChannelState, id: number) {
      const i = state.channels.findIndex(ch => ch.channelId === id);
      state.channels[i].fav = false;
    },
    [_mutation.Clear](state: ChannelState) {
      state.channels = [];
    },
    [_mutation.Stop](state: ChannelState) {
      for (let i = 0; i < state.channels.length; i += 1) {
        state.channels[i].isRecording = false;
      }
    }
  }
};
