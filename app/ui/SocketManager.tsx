"use client";
import { useEffect } from "react";
import socket from "@/lib/socketClient";

export default function SocketManager({ name, userId }: { name: string; userId?: string }) {
  useEffect(() => {
    if (!name) return;

    const s = socket;
    if (!s) return;

    const onConnect = () => {
      s.emit("set user", { name, userId });
    };

    const onOnlineUsers = (userIds: string[]) => {
      window.dispatchEvent(
        new CustomEvent("online-users", { detail: userIds })
      );
    };

    s.on("connect", onConnect);
    s.on("users-online", onOnlineUsers);

    if (s.connected) {
      onConnect();
    }

    return () => {
      s.off("connect", onConnect);
      s.off("users-online", onOnlineUsers);
    };
  }, [name, userId]);

  return null;
}
