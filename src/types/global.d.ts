/// <reference types="vite/client" />

declare global {
  interface Window {
    APP_APIURL: string;
    APP_BASE: string;
    APP_NAME: string;
    APP_SOCKETURL: string;
    APP_FILEURL: string;
    APP_BUILD: string;
    APP_VERSION: string;
  }

  type TaskInfo = {
    steps: number;
    step: number;
    pid: number;
    command: string;
    message: string;
  };

  type JobMessage<T> = {
    data: T;
    job: Job;
  };

  type TaskComplete = {
    steps: number;
    step: number;
    message: string;
  };

  type TaskProgress = {
    current: number;
    total: number;
    steps: number;
    step: number;
    message: string;
  };

  type JobState = {
    jobs: Job[];
    jobsCount: number;
  };

  type ToastState = {
    toasts: Toast[];
  };

  type ToastKind = "success" | "error" | "warning" | "info";

  type Toast = {
    title: string;
    message: string;
    hide: boolean;
    created: Date;
    countdown: number;
    kind: ToastKind;
  };

  type AuthState = {
    loggedIn: boolean;
    token: string | null | undefined;
  };

  type ChannelState = {
    channels: ChannelInfo[];
  };

  type Marking = {
    selected?: boolean;
    start: number;
    end: number;
    timestart: number;
    timeend: number;
  };

  type AuthHeader = {
    Authorization: string;
  };

  type ChannelUpdate = {
    isPaused: boolean;
    channelId: number;
    channelName: string;
    url: string;
    displayName: string;
    skipStart: number;
    minDuration: number;
  };

  type JobTableItem = DatabaseJob & {
    createdAtFromNow: string;
    startedFromNow?: string;
    completedAtFromNow?: string;
    jobDuration?: string;
  };
}

export {};
