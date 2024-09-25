import { StreamSinkClient, DatabaseRecording as RecordingResponse, ResponsesRecordingStatusResponse, HttpClient, Auth } from './StreamSinkClient';
import axios, { AxiosResponse } from 'axios';
import { CancelTokenSource } from 'axios';
import AuthService, { AuthHeader } from "../../auth.service.ts";

const apiUrl = window.VUE_APP_APIURL;

// The type annotations of swagger-gen for baseApiParams are wrong.
// That's the reason for couple of ts-ignores.

const unauthorizedInterceptor = (error: any) => {
  if (error.config.url !== '/auth/login' && error.response && error.response.status === 401) {
    AuthService.logout();
    window.location.assign('/login');
  }
  return Promise.reject(error);
};

export class MyClient extends StreamSinkClient<any> {
  constructor(header: AuthHeader | null) {
    const client = new HttpClient({
      baseURL: apiUrl,
      headers: {...header},
    });
    client.instance.interceptors.response.use(value => value, unauthorizedInterceptor);
    super(client);
  }

  /**
   * Custom function to upload and cancel large files with progress indicator.
   * @param channelId Upload to which channel
   * @param file File object to upload
   * @param progress Returns the progress as number in range [0.0 ... 1.0]
   */
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void): [ Promise<AxiosResponse<RecordingResponse>>, CancelTokenSource ] {
    const header = AuthService.getAuthHeader();
    const source = axios.CancelToken.source();
    const formData = new FormData();
    formData.append('file', file);

    return [ axios.post(`${apiUrl}/channels/${channelId}/upload`, formData, {
      cancelToken: source.token,
      headers: { 'Content-Type': 'multipart/form-data', ...header },
      onUploadProgress: progressEvent => progressEvent.total ? progress(progressEvent.loaded / progressEvent.total) : 0
    }), source ];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    const header = AuthService.getAuthHeader();
    //@ts-ignore
    const res = await axios.get<ResponsesRecordingStatusResponse>(`${apiUrl}/recorder`, { headers: header || {} });
    //@ts-ignore
    return res.data.isRecording;
  }
}

export const createClient = (): MyClient => {
  const header = AuthService.getAuthHeader();
  return new MyClient(header);
};
