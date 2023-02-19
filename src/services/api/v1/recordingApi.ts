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

  convert(channel: string, file: string, mediaType: string): Promise<AxiosResponse<RecordingResponse[]>> {
    return this.axios.post(`/recordings/${channel}/${file}/${mediaType}/convert`);
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

  fav(channelName: string, filename: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/${channelName}/${filename}/fav`);
  }

  unfav(channelName: string, filename: string): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/${channelName}/${filename}/unfav`);
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

  getRandom(limit: string | number): Promise<AxiosResponse<RecordingResponse[]>> {
    return this.axios.get(`/recordings/random/${limit}?bump=${new Date().getTime()}`);
  }

  isUpdating(): Promise<AxiosResponse<boolean>> {
    return this.axios.get(`/recordings/isupdating`);
  }

  getSorted(column: string, order: string, limit: string) {
    return this.axios.get(`/recordings/sorted/${column}/${order}/${limit}`);
  }

  getBookmarks(): Promise<AxiosResponse<RecordingResponse[]>> {
    return this.axios.get(`/recordings/bookmarks`);
  }

  updateInfo(): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/updateinfo`);
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

  posters(): Promise<AxiosResponse<void>> {
    return this.axios.post(`/recordings/generate/posters`);
  }
}
