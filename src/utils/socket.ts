const socketUrl = import.meta.env.SSR ? import.meta.env.VITE_VUE_APP_SOCKETURL : window.VUE_APP_SOCKETURL;
const listeners: { [key: string]: ((data: Object) => void)[] } = {};

const addListener = (event: string, fn: (data: Object) => void) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
};

const notify = (event: string, data: object) => {
  if (!listeners[event]) {
    return;
  }

  if (listeners[event]) {
    listeners[event].forEach(fn => fn(data));
  }
};

// Run only on client.
if (!import.meta.env.SSR) {
  const c = new WebSocket(socketUrl);

  c.onmessage = (msg: any) => {
    const json = JSON.parse(msg.data) as { name: string, data: Object };
    notify(json.name, json.data);
  };

  c.onopen = () => {
    console.log('open ws');
  };

  c.onerror = (ev: Event) => {
    console.error(ev);
  };
}

export const socket = {
  on: addListener
};

export const MessageType = {
  HeartBeat: 'heartbeat',

  ChannelOnline: 'channel:online',
  ChannelOffline: 'channel:offline',
  ChannelThumbnail: 'channel:thumbnail',
  ChannelStart: 'channel:start',

  RecordingAdd: 'recording:add',

  JobCreate: 'job:create',
  JobDestroy: 'job:destroy',
  JobPreviewDone: 'job:preview:done',
  JobProgress: 'job:progress',
  JobPreviewProgress: 'job:preview:progress'
};
