import { io } from "socket.io-client";

const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

// Establish the connection
const socket = io(socketServerUrl, {
  reconnection: true,
  transports: ["websocket"], // Force websocket for faster connection
});

export default socket;