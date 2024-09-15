import { StreamSinkClient, DatabaseRecording as RecordingResponse, ResponsesRecordingStatusResponse, HttpClient } from './StreamSinkClient';
import axios, { AxiosResponse } from 'axios';
import { CancelTokenSource } from 'axios';

const apiUrl = window.VUE_APP_APIURL;

const getHeader = () => {
  const token = localStorage.getItem('token');
  let header = null;
  if (token) {
    header = { Authorization: 'Bearer ' + token };
  }

  return header;
};

export class MyClient extends StreamSinkClient<any> {
  constructor(header: HeadersInit | undefined = undefined) {
    const client = new HttpClient({
      baseApiParams: { headers: header || {} },
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
    const header = getHeader();
    const source = axios.CancelToken.source();
    const formData = new FormData();
    formData.append('file', file);

    return [axios.post(`${apiUrl}/channels/${channelId}/upload`, formData, {
      cancelToken: source.token,
      headers: { 'Content-Type': 'multipart/form-data', ...header },
      onUploadProgress: progressEvent => progressEvent.total ? progress(progressEvent.loaded / progressEvent.total) : 0
    }), source];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    const header = getHeader();
    const res = await axios.get<ResponsesRecordingStatusResponse>(`${apiUrl}/recorder`, { headers: header || {} });
    return res.data.isRecording;
  }
}

export const createClient = (): MyClient => {
  const header = getHeader();
  const init: HeadersInit | undefined = header ? [['Authorization', header.Authorization]] : undefined;

  return new MyClient(init);
};
