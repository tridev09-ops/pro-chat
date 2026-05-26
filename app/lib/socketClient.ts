import { io } from "socket.io-client";

const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

if (!socketServerUrl) {
  console.error(
    "[socketClient] NEXT_PUBLIC_SOCKET_SERVER_URL is not set. " +
    "Socket connection will not be established. " +
    "Set this in Vercel project env vars pointing to your Render socket server URL."
  );
}

const socket = socketServerUrl
  ? io(socketServerUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      transports: ["websocket"],
    })
  : null;

export default socket;