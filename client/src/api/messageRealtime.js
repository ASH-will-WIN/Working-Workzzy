import { io } from "socket.io-client";

let socket;

export const connectMessageRealtime = (token) => {
  if (!token) return null;
  if (socket?.connected) return socket;

  const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
  socket = io(apiUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
};

export const disconnectMessageRealtime = () => {
  socket?.disconnect();
  socket = undefined;
};
