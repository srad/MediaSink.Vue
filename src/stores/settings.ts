import { defineStore } from 'pinia';

export type ChannelsViewLayout = 'grid' | 'list';

export type SettingsState = {
  videoVolume: number;
  videoMuted: boolean;
  channelsView: ChannelsViewLayout;
  filterViewPageSize: number;
};

export const useSettingsStore = defineStore('settings', {
  persist: true,
  state: (): SettingsState => ({
    channelsView: 'grid',
    videoVolume: 1.0,
    videoMuted: true,
    filterViewPageSize: 100,
  }),
  actions: {
    mute() {
      this.videoMuted = true;
    },
    unmute() {
      this.videoMuted = false;
    },
    setVolume(volume: number) {
      this.videoVolume = volume;
    },
    setChannelsLayout(layout: ChannelsViewLayout) {
      this.channelsView = layout;
    },
    setFilterViewPageSize(size: number) {
      this.filterViewPageSize = size;
    }
  },
  getters: {
    isMuted(state: SettingsState): boolean {
      return state.videoMuted;
    },
    getVolume(state: SettingsState): number {
      return state.videoVolume;
    },
    isChannelsGridLayout(state: SettingsState): boolean {
      return state.channelsView === 'grid';
    },
    isChannelsListLayout(state: SettingsState): boolean {
      return state.channelsView === 'list';
    },
    filterPageSize(state: SettingsState): number {
      return state.filterViewPageSize;
    }
  },
});
