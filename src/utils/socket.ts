//@ts-nocheck

const c = new WebSocket(window.VUE_APP_SOCKETURL);

// const send = function (data: any) {
//   c.send(JSON.stringify(data));
// };

const listeners = {};

function addListener(event: string, fn: (data: Object) => void) {
  
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
}

function notify(event: string, data: object) {
  if (!listeners[event]) {
    return;
  }

  if (listeners[event]) {
    listeners[event].forEach(fn => fn(data));
  }
}

c.onmessage = (msg: any) => {
  const json = JSON.parse(msg.data) as { name: string, data: Object };
  notify(json.name, json.data);
};

c.onopen = function () {
  console.log('open ws');
};

c.onerror = (ev: Event) => {
  console.error(ev);
};

export default {
  on: addListener
};
