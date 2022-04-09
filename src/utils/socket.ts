//@ts-ignore
const c = new WebSocket(process.env.VUE_APP_SOCKETURL);

// const send = function (data: any) {
//   c.send(JSON.stringify(data));
// };

const listeners = {};

function addListener(event: string, fn: (data: Object) => void) {
  // @ts-ignore
  if (!listeners[event]) {
    // @ts-ignore
    listeners[event] = [];
  }
  // @ts-ignore
  listeners[event].push(fn);
}

function notify(event: string, data: object) {
  // @ts-ignore
  if (!listeners[event]) {
    return;
  }
  // @ts-ignore
  listeners[event].forEach(fn => fn(data));
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
