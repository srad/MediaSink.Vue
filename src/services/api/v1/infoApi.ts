import { BaseApi } from './base';
import axios, { AxiosResponse } from 'axios';

export interface DevStat {
  name: string;
  receivedBytes: number;
  transmittedBytes: number;
  measureSeconds: number;
}

export interface NetInfo {
  transmitBytes: number;
  receiveBytes: number;
  dev: string;
}

export interface DiskInfo {
  size: string;
  used: string;
  avail: string;
  pcent: string;
}

export interface InfoResponse {
  cpuInfo: {
    loadCpu: {
      cpu: string;
      load: number;
    }[]
  };
  diskInfo: DiskInfo;
  netInfo: NetInfo;
}

export interface JsonInfo {
  build: string;
}

export class InfoApi extends BaseApi {
  constructor() {
    super();
  }

  info(): Promise<AxiosResponse<JsonInfo>> {
    return axios.get('/config.json');
  }

  fetch(seconds: number): Promise<AxiosResponse<InfoResponse>> {
    return this.axios.get(`/info/${seconds}`);
  }

  disk(): Promise<AxiosResponse<DiskInfo>> {
    return this.axios.get(`/info/disk`);
  }
}
