import {BaseApi} from "./base";
import {AxiosResponse} from "axios";

export interface JobResponse {
  jobId: number;
  channelName: string;
  filename: string;
  status: string;
  args: string;
  progress: string;
  createdAt: string;
}

export class JobApi extends BaseApi {
  constructor() {
    super();
  }

  fetch(): Promise<AxiosResponse<JobResponse[]>> {
    return this.axios.get(`/jobs`);
  }
}
