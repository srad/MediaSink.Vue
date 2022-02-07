import { BaseApi } from './base';
import { AxiosResponse } from 'axios';

export interface DevStat {
  name: string;
  receivedBytes: number;
  transmittedBytes: number;
  measureSeconds: number;
}

export interface InfoResponse {
  cpuInfo: {
    loadCpu: {
      cpu: string;
      load: number;
    }[]
  };
  diskInfo: {
    size: string;
    used: string;
    avail: string;
    pcent: string;
  };
  netInfo: {
    transmitBytes: number;
    receiveBytes: number;
    dev: string;
  };
}

export class InfoApi extends BaseApi {
  constructor() {
    super();
  }

  fetch(seconds: number): Promise<AxiosResponse<InfoResponse>> {
    return this.axios.get(`/info/${seconds}`);
  }
}
