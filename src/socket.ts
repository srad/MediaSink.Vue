const URL = process.env.VUE_APP_SOCKETURL;
import {io} from "socket.io-client";

const sock = io(URL, {autoConnect: true, transports: ["websocket", "polling", "flashsocket"]});

sock.on("connect_error", (e) => {
  console.log("connect error: ", e);
});

export default sock;
