import { BaseApi } from './base';
import { AxiosResponse } from 'axios';

export interface ChannelResponse {
  channelId: number;
  RecordingsCount: number;
  channelName: string;
  isPaused: boolean;
  createdAt: string;
  isRecording: boolean;
  isOnline: boolean;
  preview: string;
  url: string;
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

  write(channelName: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/channels/${channelName}/write`);
  }
}
