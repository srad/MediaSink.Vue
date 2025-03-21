import { useAuthStore } from "../stores/auth";

type ListenerType = (data: unknown) => void;

type SocketMessage = { data: string };

export class SocketManager {
  private static connection: WebSocket | null = null;
  private static listeners: { [key: string]: ListenerType[] } = {};
  private instanceListeners: { [key: string]: ListenerType[] } = {};
  private static pendingPromise: Promise<WebSocket> | null = null; // Track pending connection attempts

  // The callee can optionally wait for the promise.
  // Either, the socket is already open and the promise is resolved.
  // Or the connection is created and resolved, once the websocket is open.
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
      SocketManager.connection = new WebSocket(window.APP_SOCKETURL + "?Authorization=" + authStore.getToken);

      SocketManager.connection.addEventListener("message", SocketManager.invokeNotify.bind(SocketManager));

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

  private static invokeNotify(rawMessage: SocketMessage) {
    const json = JSON.parse(rawMessage.data) as { name: string; data: object };
    SocketManager.notify(json.name, json.data);
  }

  private static notify(event: string, data: unknown) {
    if (SocketManager.listeners[event]) {
      SocketManager.listeners[event].forEach((fn) => fn(data));
    }
  }

  /**
   * Destroys all listeners.
   */
  close(): void {
    this.offGlobal();
    this.instanceListeners = {};
  }

  on(event: string, fn: ListenerType) {
    // Init
    if (!this.instanceListeners[event]) {
      this.instanceListeners[event] = [];
    }
    if (!SocketManager.listeners[event]) {
      SocketManager.listeners[event] = [];
    }

    // Add function reference.
    SocketManager.listeners[event].push(fn);
    this.instanceListeners[event].push(fn);
  }

  /**
   * Removes a listener function. Notice that you can only remove non-anonymous functions,
   * since the compiler generate function references on-the-fly for them, in-place.
   * so do not do:
   *  manager.on('some-event', () => ...)
   *  but instead:
   *  function abc() {...};
   *  // Both functions reference the same function reference.
   *  manager.on('some-event', abc);
   *  manager.off('some-event', abc);
   * @param event
   * @param fn
   */
  off(event: string, fn: ListenerType) {
    this.offInstance(event, fn);
    this.offFnFromGlobalListener(event, fn);
  }

  private offInstance(event: string, fn: ListenerType) {
    if (this.instanceListeners[event]) {
      this.instanceListeners[event] = this.instanceListeners[event].filter((listener) => listener !== fn);
    }
  }

  /**
   * Remove instance listeners from global array.
   * @private
   */
  private offGlobal() {
    const instanceFns = Object.values(this.instanceListeners).flat();

    // Filter out functions that exist in instanceFns
    for (const eventName in SocketManager.listeners) {
      SocketManager.listeners[eventName] = SocketManager.listeners[eventName].filter((listener) => !instanceFns.includes(listener));
    }
  }

  private offFnFromGlobalListener(eventName: string, fn: ListenerType) {
    SocketManager.listeners[eventName] = SocketManager.listeners[eventName].filter((listener) => listener !== fn);
  }
}

export const MessageType = {
  HeartBeat: "heartbeat",

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
};
