import { StreamSinkClient, ModelsRecording as RecordingResponse, V1RecordingStatus, HttpClient } from './StreamSinkClient';
import axios, { AxiosResponse } from 'axios';
import { CancelTokenSource } from 'axios';

const apiUrl = import.meta.env.VITE_VUE_APP_APIURL;

export class MyClient extends StreamSinkClient<any> {
  constructor() {
    const client = new HttpClient({
      baseUrl: apiUrl,
    });
    super(client);
  }

  /**
   * Custom function to upload and cancel large files with progress indicator.
   * @param channelId Upload to which channel
   * @param file File object to upload
   * @param progress Returns the progress as number in range [0.0 ... 1.0]
   */
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void): [Promise<AxiosResponse<RecordingResponse>>, CancelTokenSource] {
    const source = axios.CancelToken.source();
    const formData = new FormData();
    formData.append('file', file);

    return [axios.post(`${apiUrl}/channels/${channelId}/upload`, formData, {
      cancelToken: source.token,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressEvent => progressEvent.total ? progress(progressEvent.loaded / progressEvent.total) : 0
    }), source];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    const res = await axios.get<V1RecordingStatus>(`${apiUrl}/recorder`);
    return res.data.isRecording;
  }
}

export const createClient = (): MyClient => new MyClient();
