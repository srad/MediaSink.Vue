/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ChannelsDeleteParams {
  /** Channel id */
  id: number;
}

export interface ChannelsDetailParams {
  /** Channel id */
  id: number;
}

export interface ChannelsPartialUpdateParams {
  /** Channel id */
  id: number;
}

export interface ConvertCreateParams {
  /** video item id */
  id: number;
  /** Media type to convert to: 720, 1080, mp3 */
  mediaType: string;
}

export interface CutCreateParams {
  /** video item id */
  id: number;
}

export interface DatabaseChannel {
  channelId: number;
  channelName: string;
  createdAt: string;
  deleted: boolean;
  displayName: string;
  fav: boolean;
  isPaused: boolean;
  minDuration: number;
  /** 1:n */
  recordings?: DatabaseRecording[];
  /** Only for query result. */
  recordingsCount: number;
  recordingsSize: number;
  skipStart: number;
  tags?: string[];
  url: string;
}

export interface DatabaseJob {
  active: boolean;
  args?: string;
  channelId: number;
  /** Unique entry, this is the actual primary key */
  channelName: string;
  command?: string;
  completedAt: string;
  createdAt: string;
  filename: string;
  filepath: string;
  info?: string;
  jobId: number;
  /** Additional information */
  pid?: number;
  progress?: string;
  recordingId: number;
  startedAt: string;
  status: DatabaseJobStatus;
  /** Default values only not to break migrations. */
  task: DatabaseJobTask;
}

export enum DatabaseJobOrder {
  JobOrderASC = "ASC",
  JobOrderDESC = "DESC",
}

export enum DatabaseJobStatus {
  StatusJobCompleted = "completed",
  StatusJobOpen = "open",
  StatusJobError = "error",
  StatusJobCanceled = "canceled",
}

export enum DatabaseJobTask {
  TaskConvert = "convert",
  TaskPreviewCover = "preview-cover",
  TaskPreviewStrip = "preview-stripe",
  TaskPreviewVideo = "preview-video",
  TaskCut = "cut",
}

export interface DatabaseRecording {
  bitRate: number;
  bookmark: boolean;
  /** @min 0 */
  channelId: number;
  channelName: string;
  createdAt: string;
  duration: number;
  filename: string;
  height: number;
  /** Total number of video packets/frames. */
  packets: number;
  pathRelative: string;
  previewCover?: string;
  previewStripe?: string;
  previewVideo?: string;
  /** @min 0 */
  recordingId: number;
  size: number;
  videoType: string;
  width: number;
}

export interface DownloadDetailParams {
  /** Recording item id */
  id: number;
}

export interface FavPartialUpdateParams {
  /** Channel id */
  id: number;
}

export interface FavPartialUpdateParams2 {
  /** video item id */
  id: number;
}

export interface HelpersCPUInfo {
  loadCpu: HelpersCPULoad[];
}

export interface HelpersCPULoad {
  cpu: string;
  createdAt: string;
  load: number;
}

export interface HelpersDiskInfo {
  availFormattedGb: number;
  pcent: number;
  sizeFormattedGb: number;
  usedFormattedGb: number;
}

export interface HelpersNetInfo {
  createdAt: string;
  dev: string;
  receiveBytes: number;
  transmitBytes: number;
}

export interface HelpersSysInfo {
  cpuInfo: HelpersCPUInfo;
  diskInfo: HelpersDiskInfo;
  netInfo: HelpersNetInfo;
}

export interface InfoDetailParams {
  /** Number of seconds to measure */
  seconds: number;
}

export interface JobsCreateParams {
  /** Recording item id */
  id: string;
}

export interface JobsDeleteParams {
  /** Job id */
  id: number;
}

export interface PauseCreateParams {
  /** Channel id */
  id: number;
}

export interface PreviewCreateParams {
  /** videos item id */
  id: number;
}

export enum QueriesSortOrder {
  SortAsc = "asc",
  SortDesc = "desc",
}

export interface RandomDetailParams {
  /** Number of random videos to return */
  limit: number;
}

export interface RequestsAuthenticationRequest {
  password: string;
  username: string;
}

export interface RequestsChannelRequest {
  channelName: string;
  deleted?: boolean;
  displayName: string;
  fav?: boolean;
  isPaused: boolean;
  minDuration: number;
  skipStart: number;
  tags?: string[];
  url: string;
}

export interface RequestsChannelTagsUpdateRequest {
  tags: string[];
}

export interface RequestsCutRequest {
  deleteAfterCut: boolean;
  ends: string[];
  starts: string[];
}

export interface RequestsJobsRequest {
  skip?: number;
  sortOrder: DatabaseJobOrder;
  states: DatabaseJobStatus[];
  take?: number;
}

export interface RequestsVideoFilterRequest {
  skip?: number;
  sortColumn: RequestsVideoSortColumn;
  sortOrder: QueriesSortOrder;
  take?: number;
}

export enum RequestsVideoSortColumn {
  SortColumnCreatedAt = "created_at",
  SortColumnSize = "size",
  SortColumnDuration = "duration",
}

export interface ResponsesImportInfoResponse {
  isImporting?: boolean;
  progress?: number;
  size?: number;
}

export interface ResponsesJobWorkerStatus {
  isProcessing: boolean;
}

export interface ResponsesJobsResponse {
  jobs?: DatabaseJob[];
  skip: number;
  take: number;
  totalCount: number;
}

export interface ResponsesLoginResponse {
  token: string;
}

export interface ResponsesRecordingStatusResponse {
  isRecording: boolean;
}

export interface ResponsesServerInfoResponse {
  commit: string;
  version: string;
}

export interface ResponsesVideoFilterResponse {
  skip: number;
  take: number;
  totalCount: number;
  videos?: DatabaseRecording[];
}

export interface ResumeCreateParams {
  /** Channel id */
  id: number;
}

export interface ServicesChannelInfo {
  channelId: number;
  channelName: string;
  createdAt: string;
  deleted: boolean;
  displayName: string;
  fav: boolean;
  isOnline: boolean;
  isPaused: boolean;
  isRecording: boolean;
  isTerminating: boolean;
  minDuration: number;
  minRecording: number;
  preview: string;
  /** 1:n */
  recordings?: DatabaseRecording[];
  /** Only for query result. */
  recordingsCount: number;
  recordingsSize: number;
  skipStart: number;
  tags?: string[];
  url: string;
}

export interface ServicesProcessInfo {
  args?: string;
  id?: number;
  output?: string;
  path?: string;
  pid?: number;
}

export interface StopCreateParams {
  /** Process ID */
  pid: number;
}

export interface TagsPartialUpdateParams {
  /** Channel id */
  id: number;
}

export interface UnfavPartialUpdateParams {
  /** Channel id */
  id: number;
}

export interface UnfavPartialUpdateParams2 {
  /** video item id */
  id: number;
}

export interface UploadCreateParams {
  /** Channel id */
  id: number;
}

export interface UploadCreatePayload {
  /** Video file to upload */
  file: File;
}

export interface VideosDeleteParams {
  /** video item id */
  id: number;
}

export interface VideosDetailParams {
  /** videos item id */
  id: number;
}

export namespace Admin {
  /**
   * @description Get the current import progress status and information
   * @tags admin
   * @name ImportList
   * @summary Returns current import progress information
   * @request GET:/admin/import
   * @response `200` `ResponsesImportInfoResponse` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace ImportList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesImportInfoResponse;
  }

  /**
   * @description Import all mp4 files in the recordings directory that are not yet in the system database
   * @tags admin
   * @name ImportCreate
   * @summary Run once the import of mp4 files in the recordings folder
   * @request POST:/admin/import
   * @response `200` `any` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace ImportCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description version information
   * @tags admin
   * @name VersionList
   * @summary Returns server version information
   * @request GET:/admin/version
   * @response `200` `ResponsesServerInfoResponse` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace VersionList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesServerInfoResponse;
  }
}

export namespace Auth {
  /**
   * @description User login
   * @tags auth
   * @name LoginCreate
   * @summary User login
   * @request POST:/auth/login
   * @response `200` `ResponsesLoginResponse` JWT token for authentication
   * @response `400` `string` Error message
   * @response `401` `string` Error message
   */
  export namespace LoginCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RequestsAuthenticationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesLoginResponse;
  }

  /**
   * @description User logout, clears the authentication session
   * @tags auth
   * @name LogoutCreate
   * @summary User logout
   * @request POST:/auth/logout
   * @response `200` `any` Logout successful message
   * @response `400` `string` Error message
   * @response `401` `string` Error message
   */
  export namespace LogoutCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Create a new user account with username and password
   * @tags auth
   * @name SignupCreate
   * @summary Create new user account
   * @request POST:/auth/signup
   * @response `200` `any` User created successfully
   * @response `400` `string` Error message
   * @response `500` `string` Error message
   */
  export namespace SignupCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RequestsAuthenticationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

export namespace Channels {
  /**
   * @description Return a list of channels
   * @tags channels
   * @name ChannelsList
   * @summary Return a list of channels
   * @request GET:/channels
   * @response `200` `(ServicesChannelInfo)[]` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace ChannelsList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ServicesChannelInfo[];
  }

  /**
   * @description Add a new channel
   * @tags channels
   * @name ChannelsCreate
   * @summary Add a new channel
   * @request POST:/channels
   * @response `200` `ServicesChannelInfo` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace ChannelsCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RequestsChannelRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ServicesChannelInfo;
  }

  /**
   * @description Return the data of one channel
   * @tags channels
   * @name ChannelsDetail
   * @summary Return the data of one channel
   * @request GET:/channels/{id}
   * @response `200` `ServicesChannelInfo` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace ChannelsDetail {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ServicesChannelInfo;
  }

  /**
   * @description Delete a channel and all its associated recordings
   * @tags channels
   * @name ChannelsDelete
   * @summary Delete channel
   * @request DELETE:/channels/{id}
   * @response `200` `any` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace ChannelsDelete {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Update channel data
   * @tags channels
   * @name ChannelsPartialUpdate
   * @summary Update channel data
   * @request PATCH:/channels/{id}
   * @response `200` `DatabaseChannel` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace ChannelsPartialUpdate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = RequestsChannelRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseChannel;
  }

  /**
   * @description Mark a channel as favorite/bookmarked
   * @tags channels
   * @name FavPartialUpdate
   * @summary Bookmark a channel
   * @request PATCH:/channels/{id}/fav
   * @response `200` `any` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace FavPartialUpdate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Pause/stop recording for a channel
   * @tags channels
   * @name PauseCreate
   * @summary Pause channel recording
   * @request POST:/channels/{id}/pause
   * @response `200` `any` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace PauseCreate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Resume/restart recording for a channel that was paused
   * @tags channels
   * @name ResumeCreate
   * @summary Resume channel recording
   * @request POST:/channels/{id}/resume
   * @response `200` `any` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace ResumeCreate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Tag a channel
   * @tags channels
   * @name TagsPartialUpdate
   * @summary Tag a channel
   * @request PATCH:/channels/{id}/tags
   * @response `200` `any` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace TagsPartialUpdate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = RequestsChannelTagsUpdateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Remove a channel from favorites/bookmarks
   * @tags channels
   * @name UnfavPartialUpdate
   * @summary Remove channel from bookmarks
   * @request PATCH:/channels/{id}/unfav
   * @response `200` `any` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace UnfavPartialUpdate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Upload a video file to a channel's recordings
   * @tags channels
   * @name UploadCreate
   * @summary Upload video file to channel
   * @request POST:/channels/{id}/upload
   * @response `200` `DatabaseRecording` OK
   * @response `400` `any` Bad Request
   * @response `500` `any` Internal Server Error
   */
  export namespace UploadCreate {
    export type RequestParams = {
      /** Channel id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UploadCreatePayload;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseRecording;
  }
}

export namespace Info {
  /**
   * @description Get disk information
   * @tags info
   * @name DiskList
   * @summary Get disk information
   * @request GET:/info/disk
   * @response `200` `HelpersDiskInfo` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace DiskList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HelpersDiskInfo;
  }

  /**
   * @description Get system metrics
   * @tags info
   * @name InfoDetail
   * @summary Get system metrics
   * @request GET:/info/{seconds}
   * @response `200` `HelpersSysInfo` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace InfoDetail {
    export type RequestParams = {
      /** Number of seconds to measure */
      seconds: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HelpersSysInfo;
  }
}

export namespace Jobs {
  /**
   * @description Allow paging through jobs by providing skip, take, statuses, and sort order.
   * @tags jobs
   * @name ListCreate
   * @summary Jobs pagination
   * @request POST:/jobs/list
   * @response `200` `ResponsesJobsResponse` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace ListCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RequestsJobsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesJobsResponse;
  }

  /**
   * @description Pause the background job processing worker
   * @tags jobs
   * @name PauseCreate
   * @summary Stop job processing worker
   * @request POST:/jobs/pause
   * @response `200` `any` OK
   * @response `500` `any` Error message
   */
  export namespace PauseCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Resume the background job processing worker
   * @tags jobs
   * @name ResumeCreate
   * @summary Start job processing worker
   * @request POST:/jobs/resume
   * @response `200` `any` OK
   * @response `500` `any` Error message
   */
  export namespace ResumeCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Interrupt a running job by process ID
   * @tags jobs
   * @name StopCreate
   * @summary Interrupt job gracefully
   * @request POST:/jobs/stop/{pid}
   * @response `200` `any` Process ID
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace StopCreate {
    export type RequestParams = {
      /** Process ID */
      pid: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Get the current job processing worker status
   * @tags jobs
   * @name WorkerList
   * @summary Get job worker status
   * @request GET:/jobs/worker
   * @response `200` `ResponsesJobWorkerStatus` OK
   * @response `500` `any` Error message
   */
  export namespace WorkerList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesJobWorkerStatus;
  }

  /**
   * @description Enqueue a preview job for a video in a channel. For now only preview jobs allowed via REST
   * @tags jobs
   * @name JobsCreate
   * @summary Enqueue a preview job
   * @request POST:/jobs/{id}
   * @response `200` `(DatabaseJob)[]` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace JobsCreate {
    export type RequestParams = {
      /** Recording item id */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseJob[];
  }

  /**
   * @description Interrupt a running job and remove it from the queue
   * @tags jobs
   * @name JobsDelete
   * @summary Interrupt and delete job gracefully
   * @request DELETE:/jobs/{id}
   * @response `200` `any` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace JobsDelete {
    export type RequestParams = {
      /** Job id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

export namespace Processes {
  /**
   * @description Return a list of streaming processes
   * @tags processes
   * @name ProcessesList
   * @summary Return a list of streaming processes
   * @request GET:/processes
   * @response `200` `(ServicesProcessInfo)[]` OK
   * @response `500` `any` Internal Server Error
   */
  export namespace ProcessesList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ServicesProcessInfo[];
  }
}

export namespace Recorder {
  /**
   * @description Get the current recording/streaming recorder status
   * @tags recorder
   * @name RecorderList
   * @summary Get recorder status
   * @request GET:/recorder
   * @response `200` `ResponsesRecordingStatusResponse` OK
   * @response `500` `any` Error message
   */
  export namespace RecorderList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesRecordingStatusResponse;
  }

  /**
   * @description Stop/pause the recording and streaming recorder
   * @tags recorder
   * @name PauseCreate
   * @summary Pause the recorder
   * @request POST:/recorder/pause
   * @response `200` `any` OK
   * @response `500` `any` Error message
   */
  export namespace PauseCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Resume/restart the recording and streaming recorder
   * @tags recorder
   * @name ResumeCreate
   * @summary Resume the recorder
   * @request POST:/recorder/resume
   * @response `200` `any` OK
   * @response `500` `any` Error message
   */
  export namespace ResumeCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

export namespace User {
  /**
   * @description Get the current authenticated user's profile information
   * @tags user
   * @name ProfileList
   * @summary Get user profile
   * @request GET:/user/profile
   * @response `200` `object` User profile
   * @response `400` `any` Bad Request
   */
  export namespace ProfileList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }
}

export namespace Videos {
  /**
   * @description Return a list of videos.
   * @tags videos
   * @name VideosList
   * @summary Return a list of videos
   * @request GET:/videos
   * @response `200` `(DatabaseRecording)[]` OK
   * @response `500` `any` Error message
   */
  export namespace VideosList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseRecording[];
  }

  /**
   * @description Returns all bookmarked videos.
   * @tags videos
   * @name BookmarksList
   * @summary Returns all bookmarked videos.
   * @request GET:/videos/bookmarks
   * @response `200` `(DatabaseRecording)[]` OK
   * @response `500` `any` Error message
   */
  export namespace BookmarksList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseRecording[];
  }

  /**
   * @description Get the top N the latest videos.
   * @tags videos
   * @name FilterCreate
   * @summary Get the top N the latest videos.
   * @request POST:/videos/filter
   * @response `200` `ResponsesVideoFilterResponse` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace FilterCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RequestsVideoFilterRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ResponsesVideoFilterResponse;
  }

  /**
   * @description Generate poster/cover images for all videos in the system
   * @tags videos
   * @name GeneratePostersCreate
   * @summary Generate cover images for all videos
   * @request POST:/videos/generate/posters
   * @response `200` `any` OK
   * @response `500` `any` Error message
   */
  export namespace GeneratePostersCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Get the status of the video metadata update process
   * @tags videos
   * @name IsupdatingCreate
   * @summary Check if video metadata update is in progress
   * @request POST:/videos/isupdating
   * @response `200` `boolean` OK
   * @response `500` `any` Error message
   */
  export namespace IsupdatingCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = boolean;
  }

  /**
   * @description Get a random selection of videos from the system
   * @tags videos
   * @name RandomDetail
   * @summary Get random videos
   * @request GET:/videos/random/{limit}
   * @response `200` `(DatabaseRecording)[]` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace RandomDetail {
    export type RequestParams = {
      /** Number of random videos to return */
      limit: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseRecording[];
  }

  /**
   * @description Update metadata information for all videos in the system
   * @tags videos
   * @name UpdateinfoCreate
   * @summary Update video metadata information
   * @request POST:/videos/updateinfo
   * @response `200` `any` OK
   * @response `500` `any` Error message
   */
  export namespace UpdateinfoCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Return a list of videos for a particular channel.
   * @tags videos
   * @name VideosDetail
   * @summary Return a list of videos for a particular channel
   * @request GET:/videos/{id}
   * @response `200` `DatabaseRecording` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace VideosDetail {
    export type RequestParams = {
      /** videos item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseRecording;
  }

  /**
   * @description Delete video
   * @tags videos
   * @name VideosDelete
   * @summary Delete video
   * @request DELETE:/videos/{id}
   * @response `200` `void` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace VideosDelete {
    export type RequestParams = {
      /** video item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Cut a video and merge all defined segments
   * @tags videos
   * @name CutCreate
   * @summary Cut a video and merge all defined segments
   * @request POST:/videos/{id}/cut
   * @response `200` `DatabaseJob` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace CutCreate {
    export type RequestParams = {
      /** video item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = RequestsCutRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseJob;
  }

  /**
   * @description Download a video file as an attachment
   * @tags videos
   * @name DownloadDetail
   * @summary Download a video file
   * @request GET:/videos/{id}/download
   * @response `200` `File` Video file
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace DownloadDetail {
    export type RequestParams = {
      /** Recording item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = File;
  }

  /**
   * @description Bookmark/favorite a video for easy access
   * @tags videos
   * @name FavPartialUpdate
   * @summary Bookmark a video
   * @request PATCH:/videos/{id}/fav
   * @response `200` `any` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace FavPartialUpdate {
    export type RequestParams = {
      /** video item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Generate preview for a certain video in a channel.
   * @tags videos
   * @name PreviewCreate
   * @summary Generate preview for a certain video in a channel
   * @request POST:/videos/{id}/preview
   * @response `200` `(DatabaseJob)[]` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace PreviewCreate {
    export type RequestParams = {
      /** videos item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseJob[];
  }

  /**
   * @description Remove/unbookmark a video from favorites
   * @tags videos
   * @name UnfavPartialUpdate
   * @summary Remove video from bookmarks
   * @request PATCH:/videos/{id}/unfav
   * @response `200` `any` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace UnfavPartialUpdate {
    export type RequestParams = {
      /** video item id */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Cut a video and merge all defined segments
   * @tags videos
   * @name ConvertCreate
   * @summary Cut a video and merge all defined segments
   * @request POST:/videos/{id}/{mediaType}/convert
   * @response `200` `DatabaseJob` OK
   * @response `400` `any` Error message
   * @response `500` `any` Error message
   */
  export namespace ConvertCreate {
    export type RequestParams = {
      /** video item id */
      id: number;
      /** Media type to convert to: 720, 1080, mp3 */
      mediaType: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DatabaseJob;
  }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/api/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data.data;
    });
  };
}

/**
 * @title No title
 * @baseUrl /api/v1
 * @contact
 */
export class MediaSinkClient<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  admin = {
    /**
     * @description Get the current import progress status and information
     *
     * @tags admin
     * @name ImportList
     * @summary Returns current import progress information
     * @request GET:/admin/import
     * @response `200` `ResponsesImportInfoResponse` OK
     * @response `500` `any` Internal Server Error
     */
    importList: (params: RequestParams = {}) =>
      this.http.request<ResponsesImportInfoResponse, any>({
        path: `/admin/import`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Import all mp4 files in the recordings directory that are not yet in the system database
     *
     * @tags admin
     * @name ImportCreate
     * @summary Run once the import of mp4 files in the recordings folder
     * @request POST:/admin/import
     * @response `200` `any` OK
     * @response `500` `any` Internal Server Error
     */
    importCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/admin/import`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description version information
     *
     * @tags admin
     * @name VersionList
     * @summary Returns server version information
     * @request GET:/admin/version
     * @response `200` `ResponsesServerInfoResponse` OK
     * @response `500` `any` Internal Server Error
     */
    versionList: (params: RequestParams = {}) =>
      this.http.request<ResponsesServerInfoResponse, any>({
        path: `/admin/version`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * @description User login
     *
     * @tags auth
     * @name LoginCreate
     * @summary User login
     * @request POST:/auth/login
     * @response `200` `ResponsesLoginResponse` JWT token for authentication
     * @response `400` `string` Error message
     * @response `401` `string` Error message
     */
    loginCreate: (
      AuthenticationRequest: RequestsAuthenticationRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<ResponsesLoginResponse, string>({
        path: `/auth/login`,
        method: "POST",
        body: AuthenticationRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description User logout, clears the authentication session
     *
     * @tags auth
     * @name LogoutCreate
     * @summary User logout
     * @request POST:/auth/logout
     * @response `200` `any` Logout successful message
     * @response `400` `string` Error message
     * @response `401` `string` Error message
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.http.request<any, string>({
        path: `/auth/logout`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new user account with username and password
     *
     * @tags auth
     * @name SignupCreate
     * @summary Create new user account
     * @request POST:/auth/signup
     * @response `200` `any` User created successfully
     * @response `400` `string` Error message
     * @response `500` `string` Error message
     */
    signupCreate: (
      AuthenticationRequest: RequestsAuthenticationRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<any, string>({
        path: `/auth/signup`,
        method: "POST",
        body: AuthenticationRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  channels = {
    /**
     * @description Return a list of channels
     *
     * @tags channels
     * @name ChannelsList
     * @summary Return a list of channels
     * @request GET:/channels
     * @response `200` `(ServicesChannelInfo)[]` OK
     * @response `500` `any` Internal Server Error
     */
    channelsList: (params: RequestParams = {}) =>
      this.http.request<ServicesChannelInfo[], any>({
        path: `/channels`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Add a new channel
     *
     * @tags channels
     * @name ChannelsCreate
     * @summary Add a new channel
     * @request POST:/channels
     * @response `200` `ServicesChannelInfo` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    channelsCreate: (
      ChannelRequest: RequestsChannelRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<ServicesChannelInfo, any>({
        path: `/channels`,
        method: "POST",
        body: ChannelRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the data of one channel
     *
     * @tags channels
     * @name ChannelsDetail
     * @summary Return the data of one channel
     * @request GET:/channels/{id}
     * @response `200` `ServicesChannelInfo` OK
     * @response `500` `any` Internal Server Error
     */
    channelsDetail: (
      { id, ...query }: ChannelsDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<ServicesChannelInfo, any>({
        path: `/channels/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a channel and all its associated recordings
     *
     * @tags channels
     * @name ChannelsDelete
     * @summary Delete channel
     * @request DELETE:/channels/{id}
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    channelsDelete: (
      { id, ...query }: ChannelsDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/channels/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update channel data
     *
     * @tags channels
     * @name ChannelsPartialUpdate
     * @summary Update channel data
     * @request PATCH:/channels/{id}
     * @response `200` `DatabaseChannel` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    channelsPartialUpdate: (
      { id, ...query }: ChannelsPartialUpdateParams,
      ChannelRequest: RequestsChannelRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseChannel, any>({
        path: `/channels/${id}`,
        method: "PATCH",
        body: ChannelRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Mark a channel as favorite/bookmarked
     *
     * @tags channels
     * @name FavPartialUpdate
     * @summary Bookmark a channel
     * @request PATCH:/channels/{id}/fav
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    favPartialUpdate: (
      { id, ...query }: FavPartialUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/channels/${id}/fav`,
        method: "PATCH",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Pause/stop recording for a channel
     *
     * @tags channels
     * @name PauseCreate
     * @summary Pause channel recording
     * @request POST:/channels/{id}/pause
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    pauseCreate: (
      { id, ...query }: PauseCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/channels/${id}/pause`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Resume/restart recording for a channel that was paused
     *
     * @tags channels
     * @name ResumeCreate
     * @summary Resume channel recording
     * @request POST:/channels/{id}/resume
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    resumeCreate: (
      { id, ...query }: ResumeCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/channels/${id}/resume`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Tag a channel
     *
     * @tags channels
     * @name TagsPartialUpdate
     * @summary Tag a channel
     * @request PATCH:/channels/{id}/tags
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    tagsPartialUpdate: (
      { id, ...query }: TagsPartialUpdateParams,
      ChannelTagsUpdateRequest: RequestsChannelTagsUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/channels/${id}/tags`,
        method: "PATCH",
        body: ChannelTagsUpdateRequest,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Remove a channel from favorites/bookmarks
     *
     * @tags channels
     * @name UnfavPartialUpdate
     * @summary Remove channel from bookmarks
     * @request PATCH:/channels/{id}/unfav
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    unfavPartialUpdate: (
      { id, ...query }: UnfavPartialUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/channels/${id}/unfav`,
        method: "PATCH",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload a video file to a channel's recordings
     *
     * @tags channels
     * @name UploadCreate
     * @summary Upload video file to channel
     * @request POST:/channels/{id}/upload
     * @response `200` `DatabaseRecording` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    uploadCreate: (
      { id, ...query }: UploadCreateParams,
      data: UploadCreatePayload,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseRecording, any>({
        path: `/channels/${id}/upload`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  info = {
    /**
     * @description Get disk information
     *
     * @tags info
     * @name DiskList
     * @summary Get disk information
     * @request GET:/info/disk
     * @response `200` `HelpersDiskInfo` OK
     * @response `500` `any` Internal Server Error
     */
    diskList: (params: RequestParams = {}) =>
      this.http.request<HelpersDiskInfo, any>({
        path: `/info/disk`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get system metrics
     *
     * @tags info
     * @name InfoDetail
     * @summary Get system metrics
     * @request GET:/info/{seconds}
     * @response `200` `HelpersSysInfo` OK
     * @response `500` `any` Internal Server Error
     */
    infoDetail: (
      { seconds, ...query }: InfoDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<HelpersSysInfo, any>({
        path: `/info/${seconds}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  jobs = {
    /**
     * @description Allow paging through jobs by providing skip, take, statuses, and sort order.
     *
     * @tags jobs
     * @name ListCreate
     * @summary Jobs pagination
     * @request POST:/jobs/list
     * @response `200` `ResponsesJobsResponse` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    listCreate: (
      JobsRequest: RequestsJobsRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<ResponsesJobsResponse, any>({
        path: `/jobs/list`,
        method: "POST",
        body: JobsRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Pause the background job processing worker
     *
     * @tags jobs
     * @name PauseCreate
     * @summary Stop job processing worker
     * @request POST:/jobs/pause
     * @response `200` `any` OK
     * @response `500` `any` Error message
     */
    pauseCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/jobs/pause`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Resume the background job processing worker
     *
     * @tags jobs
     * @name ResumeCreate
     * @summary Start job processing worker
     * @request POST:/jobs/resume
     * @response `200` `any` OK
     * @response `500` `any` Error message
     */
    resumeCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/jobs/resume`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Interrupt a running job by process ID
     *
     * @tags jobs
     * @name StopCreate
     * @summary Interrupt job gracefully
     * @request POST:/jobs/stop/{pid}
     * @response `200` `any` Process ID
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    stopCreate: (
      { pid, ...query }: StopCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/jobs/stop/${pid}`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the current job processing worker status
     *
     * @tags jobs
     * @name WorkerList
     * @summary Get job worker status
     * @request GET:/jobs/worker
     * @response `200` `ResponsesJobWorkerStatus` OK
     * @response `500` `any` Error message
     */
    workerList: (params: RequestParams = {}) =>
      this.http.request<ResponsesJobWorkerStatus, any>({
        path: `/jobs/worker`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Enqueue a preview job for a video in a channel. For now only preview jobs allowed via REST
     *
     * @tags jobs
     * @name JobsCreate
     * @summary Enqueue a preview job
     * @request POST:/jobs/{id}
     * @response `200` `(DatabaseJob)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    jobsCreate: (
      { id, ...query }: JobsCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseJob[], any>({
        path: `/jobs/${id}`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Interrupt a running job and remove it from the queue
     *
     * @tags jobs
     * @name JobsDelete
     * @summary Interrupt and delete job gracefully
     * @request DELETE:/jobs/{id}
     * @response `200` `any` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    jobsDelete: (
      { id, ...query }: JobsDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/jobs/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  processes = {
    /**
     * @description Return a list of streaming processes
     *
     * @tags processes
     * @name ProcessesList
     * @summary Return a list of streaming processes
     * @request GET:/processes
     * @response `200` `(ServicesProcessInfo)[]` OK
     * @response `500` `any` Internal Server Error
     */
    processesList: (params: RequestParams = {}) =>
      this.http.request<ServicesProcessInfo[], any>({
        path: `/processes`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  recorder = {
    /**
     * @description Get the current recording/streaming recorder status
     *
     * @tags recorder
     * @name RecorderList
     * @summary Get recorder status
     * @request GET:/recorder
     * @response `200` `ResponsesRecordingStatusResponse` OK
     * @response `500` `any` Error message
     */
    recorderList: (params: RequestParams = {}) =>
      this.http.request<ResponsesRecordingStatusResponse, any>({
        path: `/recorder`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Stop/pause the recording and streaming recorder
     *
     * @tags recorder
     * @name PauseCreate
     * @summary Pause the recorder
     * @request POST:/recorder/pause
     * @response `200` `any` OK
     * @response `500` `any` Error message
     */
    pauseCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/recorder/pause`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Resume/restart the recording and streaming recorder
     *
     * @tags recorder
     * @name ResumeCreate
     * @summary Resume the recorder
     * @request POST:/recorder/resume
     * @response `200` `any` OK
     * @response `500` `any` Error message
     */
    resumeCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/recorder/resume`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  user = {
    /**
     * @description Get the current authenticated user's profile information
     *
     * @tags user
     * @name ProfileList
     * @summary Get user profile
     * @request GET:/user/profile
     * @response `200` `object` User profile
     * @response `400` `any` Bad Request
     */
    profileList: (params: RequestParams = {}) =>
      this.http.request<object, any>({
        path: `/user/profile`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  videos = {
    /**
     * @description Return a list of videos.
     *
     * @tags videos
     * @name VideosList
     * @summary Return a list of videos
     * @request GET:/videos
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `500` `any` Error message
     */
    videosList: (params: RequestParams = {}) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/videos`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns all bookmarked videos.
     *
     * @tags videos
     * @name BookmarksList
     * @summary Returns all bookmarked videos.
     * @request GET:/videos/bookmarks
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `500` `any` Error message
     */
    bookmarksList: (params: RequestParams = {}) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/videos/bookmarks`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the top N the latest videos.
     *
     * @tags videos
     * @name FilterCreate
     * @summary Get the top N the latest videos.
     * @request POST:/videos/filter
     * @response `200` `ResponsesVideoFilterResponse` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    filterCreate: (
      VideoFilterRequest: RequestsVideoFilterRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<ResponsesVideoFilterResponse, any>({
        path: `/videos/filter`,
        method: "POST",
        body: VideoFilterRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Generate poster/cover images for all videos in the system
     *
     * @tags videos
     * @name GeneratePostersCreate
     * @summary Generate cover images for all videos
     * @request POST:/videos/generate/posters
     * @response `200` `any` OK
     * @response `500` `any` Error message
     */
    generatePostersCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/videos/generate/posters`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the status of the video metadata update process
     *
     * @tags videos
     * @name IsupdatingCreate
     * @summary Check if video metadata update is in progress
     * @request POST:/videos/isupdating
     * @response `200` `boolean` OK
     * @response `500` `any` Error message
     */
    isupdatingCreate: (params: RequestParams = {}) =>
      this.http.request<boolean, any>({
        path: `/videos/isupdating`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a random selection of videos from the system
     *
     * @tags videos
     * @name RandomDetail
     * @summary Get random videos
     * @request GET:/videos/random/{limit}
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    randomDetail: (
      { limit, ...query }: RandomDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/videos/random/${limit}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update metadata information for all videos in the system
     *
     * @tags videos
     * @name UpdateinfoCreate
     * @summary Update video metadata information
     * @request POST:/videos/updateinfo
     * @response `200` `any` OK
     * @response `500` `any` Error message
     */
    updateinfoCreate: (params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/videos/updateinfo`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of videos for a particular channel.
     *
     * @tags videos
     * @name VideosDetail
     * @summary Return a list of videos for a particular channel
     * @request GET:/videos/{id}
     * @response `200` `DatabaseRecording` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    videosDetail: (
      { id, ...query }: VideosDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseRecording, any>({
        path: `/videos/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete video
     *
     * @tags videos
     * @name VideosDelete
     * @summary Delete video
     * @request DELETE:/videos/{id}
     * @response `200` `void` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    videosDelete: (
      { id, ...query }: VideosDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/videos/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Cut a video and merge all defined segments
     *
     * @tags videos
     * @name CutCreate
     * @summary Cut a video and merge all defined segments
     * @request POST:/videos/{id}/cut
     * @response `200` `DatabaseJob` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    cutCreate: (
      { id, ...query }: CutCreateParams,
      CutRequest: RequestsCutRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseJob, any>({
        path: `/videos/${id}/cut`,
        method: "POST",
        body: CutRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Download a video file as an attachment
     *
     * @tags videos
     * @name DownloadDetail
     * @summary Download a video file
     * @request GET:/videos/{id}/download
     * @response `200` `File` Video file
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    downloadDetail: (
      { id, ...query }: DownloadDetailParams,
      params: RequestParams = {},
    ) =>
      this.http.request<File, any>({
        path: `/videos/${id}/download`,
        method: "GET",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Bookmark/favorite a video for easy access
     *
     * @tags videos
     * @name FavPartialUpdate
     * @summary Bookmark a video
     * @request PATCH:/videos/{id}/fav
     * @response `200` `any` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    favPartialUpdate: (
      { id, ...query }: FavPartialUpdateParams2,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/videos/${id}/fav`,
        method: "PATCH",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Generate preview for a certain video in a channel.
     *
     * @tags videos
     * @name PreviewCreate
     * @summary Generate preview for a certain video in a channel
     * @request POST:/videos/{id}/preview
     * @response `200` `(DatabaseJob)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    previewCreate: (
      { id, ...query }: PreviewCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseJob[], any>({
        path: `/videos/${id}/preview`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove/unbookmark a video from favorites
     *
     * @tags videos
     * @name UnfavPartialUpdate
     * @summary Remove video from bookmarks
     * @request PATCH:/videos/{id}/unfav
     * @response `200` `any` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    unfavPartialUpdate: (
      { id, ...query }: UnfavPartialUpdateParams2,
      params: RequestParams = {},
    ) =>
      this.http.request<any, any>({
        path: `/videos/${id}/unfav`,
        method: "PATCH",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Cut a video and merge all defined segments
     *
     * @tags videos
     * @name ConvertCreate
     * @summary Cut a video and merge all defined segments
     * @request POST:/videos/{id}/{mediaType}/convert
     * @response `200` `DatabaseJob` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    convertCreate: (
      { id, mediaType, ...query }: ConvertCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseJob, any>({
        path: `/videos/${id}/${mediaType}/convert`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
