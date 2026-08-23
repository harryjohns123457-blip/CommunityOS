import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

let socket = null;

export function initSocket(token) {
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.info("CommunityOS realtime connection established.");
  });

  socket.on("disconnect", (reason) => {
    console.info(
      `CommunityOS realtime connection closed: ${reason}`
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "CommunityOS realtime connection error:",
      error.message
    );
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function onSocketEvent(event, callback) {
  if (!socket) {
    console.warn(
      `Cannot subscribe to "${event}" before Socket.IO is initialized.`
    );
    return () => {};
  }

  socket.on(event, callback);

  return () => {
    socket.off(event, callback);
  };
}

export function emitSocketEvent(event, data) {
  if (!socket?.connected) {
    console.warn(
      `Cannot emit "${event}": socket is not connected.`
    );
    return;
  }

  socket.emit(event, data);
}

export function closeSocket() {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}