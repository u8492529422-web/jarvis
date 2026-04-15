import { db } from "@/lib/db";
import { chatMessages } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { formatDateFR } from "@/lib/utils";
import Link from "next/link";
import ChatMessageList from "@/components/ChatMessageList";

export const dynamic = "force-dynamic";

export default async function ChatReplayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionDate, date))
    .orderBy(asc(chatMessages.createdAt));

  const messages = rows.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 pt-6 pb-2">
        <Link href="/history" className="text-zinc-400 active:text-white text-sm mb-3 inline-block">
          ← Historique
        </Link>
        <h1 className="text-2xl font-black tracking-tight capitalize">{formatDateFR(date)}</h1>
        <p className="text-sm text-zinc-500 mb-4">{messages.length} messages</p>
      </div>
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pb-6">
        <ChatMessageList
          messages={messages}
          emptyState={<p className="text-center text-zinc-600 mt-10">Session vide.</p>}
        />
      </div>
    </div>
  );
}
