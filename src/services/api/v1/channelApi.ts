import { BaseApi } from './base';
import { AxiosResponse } from 'axios';

export interface ChannelResponse {
  channelId: number;
  recordingsCount: number;
  channelName: string;
  isPaused: boolean;
  createdAt: string;
  isRecording: boolean;
  isOnline: boolean;
  preview: string;
  fav: boolean;
  url: string;
  tags: string;
  minRecording: number;
}

export class ChannelApi extends BaseApi {
  constructor() {
    super();
  }

  add(data: { channelName: string, url: string }): Promise<AxiosResponse<ChannelResponse>> {
    return this.axios.post('/channels', data);
  }

  destroy(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.delete(`/channels/${channelName}`);
  }

  getChannels(): Promise<AxiosResponse<ChannelResponse[]>> {
    return this.axios.get(`/channels`);
  }

  pause(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/pause`);
  }

  resume(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/resume`);
  }

  fav(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/fav`);
  }

  unfav(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/unfav`);
  }

  tags(channelName: string, tags: string[]): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/tags`, { tags });
  }

  write(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/write`);
  }
}
