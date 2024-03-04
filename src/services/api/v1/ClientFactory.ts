import { StreamSinkClient } from '@/services/api/v1/StreamSinkClient';

export function createClient(): StreamSinkClient<any> {
  return new StreamSinkClient({ baseUrl: window.VUE_APP_APIURL });
}
