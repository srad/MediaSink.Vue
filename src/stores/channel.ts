import type { DatabaseChannel as ChannelResponse, DatabaseChannel, DatabaseRecording, RequestsChannelRequest as ChannelRequest, ServicesChannelInfo, ServicesChannelInfo as ChannelInfo } from "../services/api/v1/StreamSinkClient";
import { defineStore } from "pinia";
import { createClient } from "../services/api/v1/ClientFactory";
import { useJobStore } from "../stores/job";

export const sortChannel = (a: ChannelResponse, b: ChannelResponse) => a.channelName!.localeCompare(b.channelName!);

export const useChannelStore = defineStore("channel", {
  state: (): ChannelState => ({
    channels: [],
  }),
  getters: {
    all(): ChannelInfo[] {
      return this.channels;
    },
    notRecordingStreams(): ChannelInfo[] {
      return this.channels
        .slice()
        .filter((row: ChannelInfo) => !row.isRecording && !row.isPaused)
        .sort(sortChannel);
    },
    disabledStreams(): ChannelInfo[] {
      return this.channels
        .slice()
        .filter((row: ChannelInfo) => row.isPaused)
        .sort(sortChannel);
    },
    recordingStreams(): ChannelInfo[] {
      return this.channels
        .slice()
        .filter((row: ChannelInfo) => row.isRecording && !row.isTerminating)
        .sort(sortChannel);
    },
  },
  actions: {
    addRecording(r: DatabaseRecording) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === r.channelId ? { ...channel, recordings: [...(channel.recordings || []), r] } : channel));
    },
    async load() {
      const client = createClient();
      const data = await client.channels.channelsList();
      const sortedChannels: ServicesChannelInfo[] = (data || []).sort((a, b) => a.channelName.localeCompare(b.channelName));
      this.channels = sortedChannels || [];
    },
    save(channel: ChannelRequest): Promise<ServicesChannelInfo> {
      return new Promise((resolve, reject) => {
        const client = createClient();
        client.channels
          .channelsCreate(channel)
          .then((res) => {
            this.add(res);
            resolve(res);
          })
          .catch((res) => reject(res.error));
      });
    },
    online(channelId: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === channelId ? { ...channel, isOnline: true } : channel));
    },
    offline(channelId: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === channelId ? { ...channel, isOnline: false, isRecording: false } : channel));
    },
    thumbnail(channelId: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === channelId ? { ...channel, preview: channel.preview.split("?")[0] + `?time=${Date.now()}` } : channel));
    },
    start(channelId: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === channelId ? { ...channel, isRecording: true, isOnline: true } : channel));
    },
    add(channel: ChannelInfo) {
      if (!this.channels.some((c: ChannelInfo) => c.channelId === channel.channelId)) {
        this.channels = [...this.channels, channel];
      }
    },
    update(channel: DatabaseChannel) {
      this.channels = this.channels.map((ch: ChannelInfo) => (ch.channelId === channel.channelId ? { ...ch, ...channel } : ch));
    },
    destroy(channelId: number) {
      this.channels = this.channels.filter((x: ChannelInfo) => x.channelId !== channelId);
      useJobStore().deleteChannel(channelId);
    },
    pause(channelId: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === channelId ? { ...channel, isRecording: false, isPaused: true } : channel));
    },
    resume(channelId: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === channelId ? { ...channel, isPaused: false } : channel));
    },
    fav(id: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === id ? { ...channel, fav: true } : channel));
    },
    unfav(id: number) {
      this.channels = this.channels.map((channel: ChannelInfo) => (channel.channelId === id ? { ...channel, fav: false } : channel));
    },
    clear() {
      this.channels = [];
    },
    stop() {
      this.channels = this.channels.map((channel: ChannelInfo) => ({ ...channel, isRecording: false }));
    },
  },
});
