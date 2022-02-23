import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class BaseApi {
  axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.VUE_APP_APIURL,
      timeout: 10 * 60 * 1000,
    });

    // this.axios.interceptors.request.use(req => {
    //   const basicAuth = 'Basic ' + btoa(username + ':' + password);
    //   req.headers.Authorization = basicAuth;
    // });
    //
    // this.axios.interceptors.response.use((response) => {
    //   return response;
    // }, (error) => {
    //   // Unauthorized
    //   if (error.response.status === 401 && window.location.pathname !== '/login') {
    //     window.location.assign('/login');
    //     return;
    //   }
    //   throw error;
    // });
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
