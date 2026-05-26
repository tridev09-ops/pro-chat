'use client'
import { useState } from "react";
import socket from "@/lib/socketClient";

export default function Form({ conversationId, sender,receiverName }: { conversationId?: string, sender?: string ,receiverName?:string}) {
    const [form, setForm] = useState({
        conversationId: conversationId || "",
        message: "",
        sender: sender || "",
        receiverName: receiverName || "",
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            message: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = form.message.trim();
        if (!message) return;

        const messageObj = {
            ...form,
            message,
            clientMessageId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            createdAt: new Date().toISOString(),
        };

        // Optimistic UI: render immediately before socket/db work.
        window.dispatchEvent(
            new CustomEvent("local:chat-message", {
                detail: messageObj,
            })
        );
        if (socket) {
            socket.emit('chat message', messageObj);
        }
        setForm({
            ...form,
            message: ""
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex py-4 justify-center w-full bg-surface border-t-2 border-border">
            <input type="text" name="message" onChange={handleChange} value={form.message} className="flex-1 border-none outline-none py-3 px-4 bg-surface-hover text-text-primary rounded-full max-w-200"
                placeholder="Enter your message..."
            />
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-4 mx-4 rounded-full transition-colors" title="Send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" x2="11" y1="2" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </form>
    );
}