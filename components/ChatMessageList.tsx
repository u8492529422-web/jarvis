"use client";

import { useEffect, useRef } from "react";
import TimerButton from "@/components/TimerButton";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: ChatMessage[];
  streaming?: boolean;
  emptyState?: React.ReactNode;
  detectTimer?: boolean;
};

const TIMER_RE_DURATION = /timer\s+(?:de\s+|d['']\s*)?(\d+)\s*min/i;
const TIMER_RE_GENERIC = /lance\s+(?:ton\s+|un\s+)?timer/i;

function extractTimerMinutes(text: string): number | null {
  const m = text.match(TIMER_RE_DURATION);
  if (m) return Math.max(1, Math.min(180, parseInt(m[1], 10)));
  if (TIMER_RE_GENERIC.test(text)) return 25;
  return null;
}

export default function ChatMessageList({ messages, streaming, emptyState, detectTimer }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pb-2">
      {messages.length === 0 && emptyState}
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;
        const showTimer =
          detectTimer &&
          msg.role === "assistant" &&
          !(streaming && isLast);
        const minutes = showTimer ? extractTimerMinutes(msg.content) : null;

        return (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <span className="text-orange-400 text-base mr-2 self-end mb-1">🤖</span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-base whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-orange-500 text-white rounded-br-md"
                  : "bg-zinc-800 text-zinc-100 rounded-bl-md"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && streaming && isLast && (
                <span className="inline-block w-1 h-4 bg-orange-400 animate-pulse ml-1 align-middle" />
              )}
              {minutes !== null && (
                <div className="mt-3">
                  <TimerButton minutes={minutes} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
