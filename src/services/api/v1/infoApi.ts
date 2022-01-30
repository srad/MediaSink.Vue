import {BaseApi} from "./base";
import {AxiosResponse} from "axios";

export interface DevStat {
  name: string;
  receivedBytes: number;
  transmittedBytes: number;
  measureSeconds: number;
}

export interface InfoResponse {
  cpuUsage: number[];
  diskTotal: number;
  diskFree: number;
  network: DevStat;
}

export class InfoApi extends BaseApi {
  constructor() {
    super();
  }

  fetch(seconds: number): Promise<AxiosResponse<InfoResponse>> {
    return this.axios.get(`/info/${seconds}`);
  }
}
