"use client";
import { useEffect } from "react";
import socket from "@/lib/socketClient";

export default function SocketManager({ name, userId }: { name: string; userId?: string }) {
  useEffect(() => {
    if (!name || !socket) return;

    const onConnect = () => {
      socket.emit("set user", { name, userId });
    };

    const onOnlineUsers = (userIds: string[]) => {
      window.dispatchEvent(
        new CustomEvent("online-users", { detail: userIds })
      );
    };

    socket.on("connect", onConnect);
    socket.on("users-online", onOnlineUsers);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("users-online", onOnlineUsers);
    };
  }, [name, userId]);

  return null;
}
