import { BaseApi } from './base';
import { AxiosResponse } from 'axios';

export class AdminApi extends BaseApi {
  constructor() {
    super();
  }

  isImporting(): Promise<AxiosResponse<boolean>> {
    return this.axios.get(`/admin/importing`);
  }

  startImport(): Promise<AxiosResponse<void>> {
    return this.axios.post(`/admin/import`);
  }
}
