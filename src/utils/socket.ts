import AuthService from "../services/auth.service.ts";

class SocketManager {
  static connection?: WebSocket = null;
  listeners: { [key: string]: ((data: Object) => void)[] } = {};

  connect() {
    if (SocketManager.connection) {
      return;
    }

    const socketUrl = import.meta.env.SSR ? import.meta.env.VITE_VUE_APP_SOCKETURL : window.VUE_APP_SOCKETURL;
    SocketManager.connection = new WebSocket(socketUrl + '?Authorization=' + AuthService.getAuthHeader()?.Authorization);

    SocketManager.connection.addEventListener('message', (msg: any) => {
      const json = JSON.parse(msg.data) as { name: string, data: Object };
      this.notify(json.name, json.data);
    });

    SocketManager.connection.addEventListener('open', () => {
      console.log('open ws');
    });

    SocketManager.connection.addEventListener('close', () => {
      console.log('close ws');
    });

    SocketManager.connection.addEventListener('error', (ev: Event) => {
      console.error(ev);
    });
  }

  close() {
    SocketManager.connection?.close();
    this.listeners = [];

    SocketManager.connection = null;
  }

  on(event: string, fn: (data: Object) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(fn);
  }

  notify(event: string, data: object) {
    if (!SocketManager.connection) {
      return;
    }

    if (!this.listeners[event]) {
      return;
    }

    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
}

export const createSocket = () => {
  return new SocketManager();
};

export const MessageType = {
  HeartBeat: 'heartbeat',

  ChannelOnline: 'channel:online',
  ChannelOffline: 'channel:offline',
  ChannelThumbnail: 'channel:thumbnail',
  ChannelStart: 'channel:start',

  RecordingAdd: 'recording:add',

  JobStart: 'job:start',
  JobCreate: 'job:create',
  JobDestroy: 'job:destroy',
  JobPreviewDone: 'job:preview:done',
  JobProgress: 'job:progress',
  JobDeleted: 'job:deleted',
  JobPreviewProgress: 'job:preview:progress'
};
