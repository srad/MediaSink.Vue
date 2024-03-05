import { StreamSinkClient, DatabaseRecording as RecordingResponse, V1RecordingStatus } from '@/services/api/v1/StreamSinkClient';
import axios, { AxiosResponse } from "axios";
import { CancelTokenSource } from 'axios';

class MyClient extends StreamSinkClient<any> {
  channelUpload(channelName: string, file: File, progress: (pcent: number) => void): [ Promise<AxiosResponse<RecordingResponse>>, CancelTokenSource ] {
    const source = axios.CancelToken.source();
    const formData = new FormData();
    formData.append('file', file);

    return [ axios.post(`${window.VUE_APP_APIURL}/channels/${channelName}/upload`, formData, {
      cancelToken: source.token,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressEvent => progressEvent.total ? progress(progressEvent.loaded / progressEvent.total) : 0
    }), source ];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    const res = await axios.get<V1RecordingStatus>(`${window.VUE_APP_APIURL}/recorder`);
    return res.data.isRecording;
  }
}

export function createClient(): MyClient {
  return new MyClient({ baseUrl: window.VUE_APP_APIURL });
}
