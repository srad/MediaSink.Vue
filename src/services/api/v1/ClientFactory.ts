import { ContentType, type DatabaseRecording, type DatabaseRecording as RecordingResponse, HttpClient, MediaSinkClient } from "./MediaSinkClient";
import { useAuthStore } from "../../../stores/auth";

const checkResponseStatus = (response: Response) => {
  if ([401].includes(response.status) && !["/login", "/register"].includes(window.location.pathname)) {
    const authStore = useAuthStore();
    authStore.logout();
    // Unauthorized: Redirect to login page
    window.location.assign("/login");
    throw new Error("Unauthorized access, redirecting to login...");
  }
};

export class MyClient extends MediaSinkClient<unknown> {
  constructor(token: string | null | undefined, apiUrl: string) {
    let auth = {};
    if (token) {
      auth = { Authorization: `Bearer ${token}` };
    }

    const client = new HttpClient({
      baseUrl: apiUrl,
      baseApiParams: {
        headers: {
          ...auth,
          "X-API-Version": window.APP_API_VERSION,
        },
      },
      /**
       * Redirect
       * @param input
       * @param init
       */
      customFetch: (input, init) => {
        return new Promise<Response>((resolve, reject) => {
          fetch(input, init)
            .then((response) => {
              checkResponseStatus(response);
              resolve(response);
            })
            .catch((err) => {
              checkResponseStatus(err);
              reject(err);
            });
        });
      },
    });
    super(client);
  }

  /**
   * Custom function to upload and cancel large files with progress indicator.
   * @param channelId Upload to which channel
   * @param file File object to upload
   * @param progress Returns the progress as number in range [0.0 ... 1.0]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void): [Promise<RecordingResponse>, AbortController] {
    const controller = new AbortController();
    const signal = controller.signal;
    const formData = new FormData();
    formData.append("file", file);

    const req = this.http.request<DatabaseRecording>({
      path: `/channels/${channelId}/upload`,
      method: "POST",
      body: formData,
      type: ContentType.FormData,
      signal,
    });

    return [req, controller];
  }

  async isRecording(): Promise<boolean> {
    const { isRecording } = await this.recorder.recorderList();
    return isRecording;
  }
}

export const createClient = (token?: string | null | undefined, apiUrl?: string): MyClient => {
  const authStore = useAuthStore();
  return new MyClient(token || authStore.getToken, apiUrl || window.APP_APIURL);
};
