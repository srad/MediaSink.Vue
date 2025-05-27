import { useAuthStore } from "../stores/auth";

declare global {
  interface Window {
    APP_SOCKETURL: string;
    APP_API_VERSION: string;
  }
}

type ListenerType<T = unknown> = (data: T) => void;

interface SocketPayload<T = unknown> {
  name: MessageTypeKey;
  data: T;
}

export class SocketManager {
  private static connection: WebSocket | null = null;

  private static listeners: Record<MessageTypeKey, ListenerType[]> = {
    "channel:offline": [],
    "channel:online": [],
    "channel:start": [],
    "channel:thumbnail": [],
    "job:activate": [],
    "job:create": [],
    "job:deactivate": [],
    "job:delete": [],
    "job:deleted": [],
    "job:done": [],
    "job:preview:done": [],
    "job:preview:progress": [],
    "job:progress": [],
    "job:start": [],
    "recording:add": [],
    pong: [],
  };

  private instanceListeners: Record<MessageTypeKey, ListenerType[]> = {
    "channel:offline": [],
    "channel:online": [],
    "channel:start": [],
    "channel:thumbnail": [],
    "job:activate": [],
    "job:create": [],
    "job:deactivate": [],
    "job:delete": [],
    "job:deleted": [],
    "job:done": [],
    "job:preview:done": [],
    "job:preview:progress": [],
    "job:progress": [],
    "job:start": [],
    "recording:add": [],
    pong: [],
  };
  private static pendingPromise: Promise<WebSocket> | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static pingInterval: ReturnType<typeof setInterval> | null = null;

  connect(): Promise<WebSocket> {
    // If a connection is already open, return it.
    if (SocketManager.connection !== null && SocketManager.connection.readyState === WebSocket.OPEN) {
      return Promise.resolve(SocketManager.connection);
    }

    // If there's an ongoing connection attempt, return its promise.
    if (SocketManager.pendingPromise) {
      return SocketManager.pendingPromise;
    }

    SocketManager.pendingPromise = new Promise<WebSocket>((resolve, reject) => {
      const authStore = useAuthStore();

      if (!authStore.isLoggedIn) {
        SocketManager.pendingPromise = null; // Clear pending promise
        reject("WebSocket missing authorization token");
        return;
      }

      // Create the WebSocket connection
      SocketManager.connection = new WebSocket(window.APP_SOCKETURL + "?Authorization=" + authStore.getToken + `&ApiVersion=${window.APP_API_VERSION}`);

      SocketManager.connection.addEventListener("message", (message) => SocketManager.handleMessage(message));

      SocketManager.connection.addEventListener("open", () => {
        console.log("WebSocket connection opened");
        resolve(SocketManager.connection!);
        SocketManager.pendingPromise = null; // Clear pending promise
      });

      SocketManager.connection.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        if (SocketManager.pendingPromise) {
          SocketManager.pendingPromise = Promise.reject(new Error("WebSocket connection closed"));
        }
        SocketManager.pendingPromise = null;
      });

      SocketManager.connection.addEventListener("error", (ev: Event) => {
        console.error("WebSocket error", ev);
        SocketManager.connection?.close();
        SocketManager.connection = null;
        SocketManager.pendingPromise = null; // Clear pending promise
        reject(ev);
      });
    });

    return SocketManager.pendingPromise;
  }

  close(): void {
    this.offGlobal();

    this.instanceListeners = {
      "channel:online": [],
      "channel:start": [],
      "channel:thumbnail": [],
      "job:activate": [],
      "job:create": [],
      "job:deactivate": [],
      "job:delete": [],
      "job:deleted": [],
      "job:done": [],
      "job:preview:done": [],
      "job:preview:progress": [],
      "job:progress": [],
      "job:start": [],
      "recording:add": [],
      pong: [],
      "channel:offline": [],
    };

    SocketManager.connection?.close();
    SocketManager.connection = null;
    SocketManager.pendingPromise = null;

    if (SocketManager.pingInterval !== null) {
      clearInterval(SocketManager.pingInterval);
      SocketManager.pingInterval = null;
    }
  }

  on<T = unknown>(event: MessageTypeKey, fn: ListenerType<T>): void {
    if (!this.instanceListeners[event]) {
      this.instanceListeners[event] = [];
    }
    if (!SocketManager.listeners[event]) {
      SocketManager.listeners[event] = [];
    }

    SocketManager.listeners[event].push(fn as ListenerType);
    this.instanceListeners[event].push(fn as ListenerType);
  }

  off<T = unknown>(event: MessageTypeKey, fn: ListenerType<T>): void {
    this.offInstance(event, fn);
    this.offGlobalFn(event, fn);
  }

  private static handleMessage(raw: MessageEvent<string>): void {
    try {
      const parsed = JSON.parse(raw.data) as SocketPayload;
      SocketManager.emit(parsed.name, parsed.data);
    } catch (e) {
      console.error("Failed to parse WebSocket message", e);
    }
  }

  private static emit<T = unknown>(event: MessageTypeKey, data: T): void {
    const listeners = SocketManager.listeners[event];
    if (listeners) {
      listeners.forEach((fn) => fn(data));
    }
  }

  private offInstance<T>(event: MessageTypeKey, fn: ListenerType<T>): void {
    this.instanceListeners[event] = (this.instanceListeners[event] || []).filter((listener) => listener !== fn);
  }

  private offGlobalFn<T>(event: MessageTypeKey, fn: ListenerType<T>): void {
    SocketManager.listeners[event] = (SocketManager.listeners[event] || []).filter((listener) => listener !== fn);
  }

  private offGlobal(): void {
    const allInstanceFns = Object.values(this.instanceListeners).flat();
    for (const event of Object.keys(SocketManager.listeners) as MessageTypeKey[]) {
      SocketManager.listeners[event] = SocketManager.listeners[event].filter((fn) => !allInstanceFns.includes(fn));
    }
  }
}

export const MessageType = {
  ChannelOnline: "channel:online",
  ChannelOffline: "channel:offline",
  ChannelThumbnail: "channel:thumbnail",
  ChannelStart: "channel:start",
  RecordingAdd: "recording:add",
  JobActivate: "job:activate",
  JobDone: "job:done",
  JobDeactivate: "job:deactivate",
  JobStart: "job:start",
  JobCreate: "job:create",
  JobDelete: "job:delete",
  JobPreviewDone: "job:preview:done",
  JobProgress: "job:progress",
  JobDeleted: "job:deleted",
  JobPreviewProgress: "job:preview:progress",
  Pong: "pong",
} as const;

export type MessageTypeKey = (typeof MessageType)[keyof typeof MessageType];
