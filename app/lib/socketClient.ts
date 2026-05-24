import { io } from "socket.io-client";

const socketServerUrl = process.env.SOCKET_SERVER_URL || "http://localhost:4000";

// Establish the connection
const socket = io(socketServerUrl, {
  reconnection: true,
  transports: ["websocket"], // Force websocket for faster connection
});

export default socket;