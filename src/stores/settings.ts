import { defineStore } from "pinia";

export enum ChannelsViewLayout {
  Grid = "grid",
  List = "list",
}

export type SettingsState = {
  videoVolume: number;
  videoMuted: boolean;
  layout: ChannelsViewLayout;
  filterViewPageSize: number;
};

export const useSettingsStore = defineStore("settings", {
  persist: true,
  state: (): SettingsState => ({
    layout: ChannelsViewLayout.Grid,
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
    updateVolume(volume: number) {
      if (volume < 0) {
        volume = 0;
      }
      if (volume > 1) {
        volume = 1;
      }
      this.videoVolume = volume;
    },
    setChannelsLayout(layout: ChannelsViewLayout) {
      this.layout = layout;
    },
    setFilterViewPageSize(size: number) {
      this.filterViewPageSize = size;
    },
  },
  getters: {
    isMuted: (state: SettingsState): boolean => {
      return state.videoMuted;
    },
    currentVolume: (state: SettingsState): number => {
      return state.videoVolume;
    },
    isChannelsGridLayout(state: SettingsState): boolean {
      return state.layout === ChannelsViewLayout.Grid;
    },
    isChannelsListLayout: (state: SettingsState): boolean => {
      return state.layout === ChannelsViewLayout.List;
    },
    filterPageSize: (state: SettingsState): number => {
      return state.filterViewPageSize;
    },
  },
});
