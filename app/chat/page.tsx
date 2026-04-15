import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 pt-6 pb-2">
        <h1 className="text-3xl font-black tracking-tight mb-1">Chat</h1>
        <p className="text-sm text-zinc-500 mb-4">Coach brutal. Aucune excuse acceptée.</p>
      </div>
      <div className="flex-1 max-w-lg mx-auto w-full px-4">
        <ChatInterface />
      </div>
    </div>
  );
}
