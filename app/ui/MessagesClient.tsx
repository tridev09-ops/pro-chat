"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import socket from "@/lib/socketClient";
import Message from "./message";
import { getDate } from "@/lib/extractTimestamp";

export type SerializableMessage = {
  _id: string;
  sender: string;
  message: string;
  createdAt: string;
};

type LocalMessageDetail = {
  conversationId?: string;
  message?: string;
  sender?: string;
  createdAt?: string;
  clientMessageId?: string;
};

function normalizeMessage(m: unknown): SerializableMessage {
  const row = m as Record<string, unknown>;
  const createdAt = row.createdAt;
  let created = new Date().toISOString();
  if (typeof createdAt === "string") {
    const parsed = new Date(createdAt);
    created = Number.isNaN(parsed.getTime()) ? created : parsed.toISOString();
  } else if (createdAt instanceof Date) {
    created = Number.isNaN(createdAt.getTime()) ? created : createdAt.toISOString();
  }

  return {
    _id: String(row._id ?? `fallback-${Math.random().toString(36).slice(2, 9)}`),
    sender: String(row.sender),
    message: String(row.message),
    createdAt: created,
  };
}

export default function MessagesClient({
  initialMessages,
  conversationId,
  currentUserId,
}: {
  initialMessages: SerializableMessage[];
  conversationId?: string;
  currentUserId?: string;
}) {
  const [messages, setMessages] = useState<SerializableMessage[]>(() =>
    initialMessages.map(normalizeMessage)
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages.map(normalizeMessage));
  }, [initialMessages]);

  useEffect(() => {
    if (!conversationId || !socket) return;

    const handler = (payload: {
      conversationId?: string;
      message?: string;
      sender?: string;
    }) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) => [
        ...prev,
        {
          _id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          sender: String(payload.sender ?? ""),
          message: String(payload.message ?? ""),
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    socket.on("chat message", handler);
    return () => {
      socket.off("chat message", handler);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const localHandler = (event: Event) => {
      const payload = (event as CustomEvent<LocalMessageDetail>).detail;
      if (!payload || payload.conversationId !== conversationId) return;

      setMessages((prev) => [
        ...prev,
        {
          _id:
            payload.clientMessageId ??
            `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          sender: String(payload.sender ?? ""),
          message: String(payload.message ?? ""),
          createdAt: String(payload.createdAt ?? new Date().toISOString()),
        },
      ]);
    };

    window.addEventListener("local:chat-message", localHandler);
    return () => {
      window.removeEventListener("local:chat-message", localHandler);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let lastDate = "";

  return (
    <div className="flex flex-1 flex-col h-20 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col h-20 items-center justify-center">
          <p className="text-text-secondary">No messages found</p>
        </div>
      ) : (
        messages.map((message) => {
          const currentDate = getDate(message.createdAt);
          const showHeader = currentDate !== lastDate;
          lastDate = currentDate;

          return (
            <React.Fragment key={message._id}>
              {showHeader && (
                <p className="text-center my-4 text-sm text-text-secondary">
                  {currentDate}
                </p>
              )}
              <Message
                message={message.message}
                sender={
                  message.sender === currentUserId ? "me" : "other"
                }
                timeStamp={message.createdAt}
              />
            </React.Fragment>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
