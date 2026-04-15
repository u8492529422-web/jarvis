"use client";

import { useEffect, useRef, useState } from "react";
import { todayStr } from "@/lib/utils";
import ChatMessageList, { ChatMessage } from "@/components/ChatMessageList";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [generatingMemory, setGeneratingMemory] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/chat?date=${todayStr()}`)
      .then((r) => r.json())
      .then((data: { role: string; content: string }[]) => {
        setMessages(
          data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
        );
      });
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);

    let assistantMsg = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const { text: delta } = JSON.parse(data);
            assistantMsg += delta;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantMsg };
              return updated;
            });
          } catch {}
        }
      }
    }

    setStreaming(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateMemory = async (type: "medium" | "long") => {
    setGeneratingMemory(type);
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    setGeneratingMemory(null);

    const label = type === "medium" ? "Bilan 7 jours" : "Profil mis à jour";
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `✅ ${label} :\n\n${data.content}`,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)]">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => generateMemory("medium")}
          disabled={!!generatingMemory}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm font-semibold py-2.5 px-3 rounded-xl transition-all min-h-11"
        >
          {generatingMemory === "medium" ? "Génération..." : "📊 Bilan 7 jours"}
        </button>
        <button
          onClick={() => generateMemory("long")}
          disabled={!!generatingMemory}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm font-semibold py-2.5 px-3 rounded-xl transition-all min-h-11"
        >
          {generatingMemory === "long" ? "Génération..." : "🧠 Profil Romain"}
        </button>
      </div>

      <ChatMessageList
        messages={messages}
        streaming={streaming}
        detectTimer
        emptyState={
          <div className="text-center text-zinc-600 text-base mt-10">
            <p className="text-4xl mb-3">🤖</p>
            <p>Parle à Jarvis. Il n&apos;attend pas.</p>
          </div>
        }
      />

      <div className="flex gap-2 pt-3 border-t border-zinc-800">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dis à Jarvis ce qui se passe..."
          rows={2}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 rounded-xl transition-all active:scale-95 self-end text-xl min-h-11"
        >
          →
        </button>
      </div>
    </div>
  );
}
