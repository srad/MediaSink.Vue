import { useAuthStore } from "../stores/auth";

type ListenerType = (data: unknown) => void;

type SocketMessage = { data: string };

export class SocketManager {
  private static connection: WebSocket | null = null;
  private static listeners: { [key: string]: ListenerType[] } = {};
  private instanceListeners: { [key: string]: ListenerType[] } = {};

  // The callee can optionally wait for the promise.
  // Either, the socket is already open and the promise is resolved.
  // Or the connection is created and resolved, once the websocket is open.
  connect(): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
      // Already connected/connecting
      if (SocketManager.connection !== null) {
        // Already connected
        if (SocketManager.connection.readyState === WebSocket.OPEN) {
          resolve(SocketManager.connection);
          return;
        }

        // Currently connecting ...
        if (SocketManager.connection?.readyState === WebSocket.CONNECTING) {
          const checker = setInterval(() => {
            if (SocketManager.connection?.readyState === WebSocket.OPEN) {
              clearInterval(checker);
              resolve(SocketManager.connection);
            } else if (SocketManager.connection?.readyState === WebSocket.CLOSING || SocketManager.connection?.readyState === WebSocket.CLOSED) {
              clearInterval(checker);
              reject("Connection already closed or closing");
            }
          }, 1000);
          return;
        }
      }

      // Not logged-in.
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        reject("WebSocket missing authorization token");
        return;
      }

      // Blocks multiple connections, wait ...
      SocketManager.connection = new WebSocket(window.APP_SOCKETURL + "?Authorization=" + authStore.getToken);

      SocketManager.connection.addEventListener("message", SocketManager.invokeNotify);

      SocketManager.connection.addEventListener("open", () => {
        resolve(SocketManager.connection!);
        console.log("open ws");
      });

      SocketManager.connection.addEventListener("close", () => {
        console.log("close ws");
      });

      SocketManager.connection.addEventListener("error", (ev: Event) => {
        console.error(ev);
        SocketManager.connection?.close();
        SocketManager.connection = null;
        reject(ev);
      });
    });
  };

  private static invokeNotify(rawMessage: SocketMessage) {
    const json = JSON.parse(rawMessage.data) as { name: string; data: object };
    SocketManager.notify(json.name, json.data);
  }

  private static notify(event: string, data: object) {
    if (!SocketManager.connection) {
      return;
    }

    if (this.listeners[event]) {
      this.listeners[event]!.forEach((fn) => fn(data));
    }
  }

  /**
   * Destroys all listeners.
   */
  close(): void {
    this.instanceListeners = {};
  };

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
  };

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
    this.offGlobalEvent(fn);
  };

  private offInstance(event: string, fn: ListenerType) {
    if (this.instanceListeners[event]) {
      for (let i = 0; i < this.instanceListeners[event].length; i++) {
        if (this.instanceListeners[event][i] === fn) {
          this.instanceListeners[event].splice(i, 1);
        }
      }
    }
  }

  private offGlobalEvent(fn: ListenerType) {
    const instanceFns = Object.values(this.instanceListeners).flat();

    // Filter out functions that exist in instanceFns
    for (const eventName in SocketManager.listeners) {
      SocketManager.listeners[eventName] = SocketManager.listeners[eventName].filter((listener) => !instanceFns.includes(listener));
    }
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
