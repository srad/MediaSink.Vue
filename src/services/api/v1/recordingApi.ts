import { BaseApi } from './base';
import { AxiosResponse } from 'axios';

export interface RecordingResponse {
  channelName: string;
  filename: string;
  pathRelative: string;
  bitRate: number;
  width: number;
  height: number;
  size: number;
  duration: number;
  videoType: string;
  bookmark: boolean;
  createdAt: string;
  previewStripe: string;
  previewVideo: string;
}

export class RecordingApi extends BaseApi {
  constructor() {
    super();
  }

  destroy(channel: string, file: string): Promise<AxiosResponse<RecordingResponse[]>> {
    return this.axios.delete(`/recordings/${channel}/${file}`);
  }

  /**
   * @param {string} channelName
   * @param {string} filename
   * @param {object} data
   * @returns {Promise<AxiosResponse<any>>}
   */
  cut(channelName: string, filename: string, data: { starts: string[], ends: string[] }): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/${channelName}/${filename}/cut`, data);
  }

  bookmark(channelName: string, filename: string, yesNo: boolean): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/${channelName}/${filename}/bookmark/${yesNo ? 1 : 0}`);
  }

  generatePreview(channelName: string, filename: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/${channelName}/${filename}/preview`);
  }

  getRecordings(channel?: string): Promise<AxiosResponse<RecordingResponse[]>> {
    if (channel) {
      return this.axios.get(`/recordings/${channel}`);
    }
    return this.axios.get(`/recordings`);
  }

  getGallery(type: string, limit: string | number): Promise<AxiosResponse<RecordingResponse[]>> {
    return this.axios.get(`/recordings/${type}/${limit}`);
  }

  getBookmarks(): Promise<AxiosResponse<RecordingResponse[]>> {
    return this.axios.get(`/recordings/bookmarks`);
  }

  updateInfo(): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recorder/updateinfo`);
  }

  isRecording(): Promise<AxiosResponse<boolean>> {
    return this.axios.get(`/recorder`);
  }

  resume(): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recorder/resume`);
  }

  pause(): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recorder/pause`);
  }
}
