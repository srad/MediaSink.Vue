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

  term(pid: number): Promise<AxiosResponse<number>> {
    return this.axios.post(`/jobs/stop/${pid}`);
  }

  destroy(jobId: number): Promise<AxiosResponse<number>> {
    return this.axios.delete(`/jobs/${jobId}`);
  }

  fetch(): Promise<AxiosResponse<JobResponse[]>> {
    return this.axios.get(`/jobs`);
  }
}
