'use server'
import connectDb from "@/lib/db/db";
import Conversation from "@/lib/db/models/conversationModel";
import Message from "@/lib/db/models/messageModel";
import { ActionResponse } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/serialize";

export async function fetchMessages(conversationId: string) {
    await connectDb();

    try {
        const conversation = await Conversation.findById(conversationId).populate({
            path: 'messages',
            model: Message
        }).lean();

        return serializeData(conversation ? conversation.messages : []);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

export async function sendMessage(form: any): Promise<ActionResponse> {
  const conversationId = form.conversationId as string;
  const messageText = form.message as string;
  const senderId = form.sender as string;

  if (!conversationId || !messageText || !senderId) {
    return { success: false, error: "All fields are required" };
  }

  await connectDb();

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    const receiverId = conversation.participants.find((p: string) => p !== senderId);

    if (!receiverId) {
      return { success: false, error: "Receiver not found" };
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: messageText,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: newMessage._id }
    });

    revalidatePath("/conversation");

    return { success: true, message: "Message sent successfully" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}