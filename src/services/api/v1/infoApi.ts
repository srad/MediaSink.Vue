import { BaseApi } from './base';
import { AxiosResponse } from 'axios';

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

export class InfoApi extends BaseApi {
  constructor() {
    super();
  }

  fetch(seconds: number): Promise<AxiosResponse<InfoResponse>> {
    return this.axios.get(`/info/${seconds}`);
  }

  disk(): Promise<AxiosResponse<DiskInfo>> {
    return this.axios.get(`/info/disk`);
  }
}
