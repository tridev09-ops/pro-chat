import Form from "@/ui/form";
import Messages from "@/ui/messages";
import Link from "next/link";
import { getCurrentUserId } from "@/routes/userFunction";
import SocketManager from "@/ui/SocketManager";
import { getUserById } from "@/routes/userFunction";

export default async function ConversationPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string, receiverName?: string, receiverEmoji?: string }>;
}) {
  const { conversationId, receiverName, receiverEmoji } = await searchParams;

  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return null;

  const currentUser = await getUserById(currentUserId);
  const socketDisplayName = currentUser?.name ?? currentUserId;

  return (
    <div className="flex flex-col h-screen bg-surface-subtle">
        <SocketManager name={socketDisplayName} userId={currentUserId ?? undefined} />
        <div className="flex flex-1 flex-col min-h-0 bg-surface-subtle">
        <div className="shrink-0 flex items-center w-full h-14 bg-surface border-b-2 border-border">
          <Link href="/" className="cursor-pointer px-4 text-text-secondary hover:text-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-center text-lg font-semibold text-text-primary">{receiverEmoji && <span className="mr-2">{decodeURIComponent(receiverEmoji)}</span>}{receiverName || "Conversation"}</h1>
        </div>
        <Messages conversationId={conversationId} currentUserId={currentUserId} />
        <div className="shrink-0">
          <Form key={conversationId} conversationId={conversationId} sender={currentUserId} receiverName={receiverName}/>
        </div>
      </div>
    </div>
  );
}