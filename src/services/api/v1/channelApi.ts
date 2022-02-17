import { BaseApi } from './base';
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import { RecordingResponse } from '@/services/api/v1/recordingApi';

export interface ChannelResponse {
  channelId: number;
  recordingsCount: number;
  channelName: string;
  isPaused: boolean;
  createdAt: string;
  isRecording: boolean;
  isOnline: boolean;
  preview: string;
  previewUpdate: Date;
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

  upload(channelName: string, file: File, progress: (pcent: number) => void): [Promise<AxiosResponse<RecordingResponse>>, CancelTokenSource] {
    const source = axios.CancelToken.source();
    const formData = new FormData();
    formData.append('file', file);

    return [this.axios.post(`/channels/${channelName}/upload`, formData, {
      cancelToken: source.token,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressEvent => progress(progressEvent.loaded / progressEvent.total)
    }), source]
  }
}
