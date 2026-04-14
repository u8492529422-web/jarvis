import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-black tracking-tight">Chat Jarvis</h1>
          <p className="text-xs text-zinc-500">Coach brutal. Aucune excuse acceptée.</p>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <ChatInterface />
      </div>
    </div>
  );
}
