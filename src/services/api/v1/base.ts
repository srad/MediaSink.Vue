import axios, {AxiosInstance, AxiosResponse} from "axios";

export class BaseApi {
  axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.VUE_APP_APIURL,
      timeout: 10000,
    });
  }

  startAll() {
    return this.axios.post(`/start-all`);
  }

  stopAll() {
    return this.axios.post(`/stop-all`);
  }

  query() {
    return this.axios;
  }
}
