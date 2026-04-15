"use client";

import { formatDateFR } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

type Checkin = {
  id: number;
  date: string;
  score: number;
  missedText: string;
  goals: string;
  jarvisResponse: string;
};

type ChatSession = {
  date: string;
  count: number;
  preview: string;
};

type Tab = "checkins" | "chats";

export default function HistoryView({ checkins }: { checkins: Checkin[] }) {
  const [tab, setTab] = useState<Tab>("checkins");
  const [sessions, setSessions] = useState<ChatSession[] | null>(null);

  useEffect(() => {
    if (tab === "chats" && sessions === null) {
      fetch("/api/chat/sessions")
        .then((r) => r.json())
        .then((data) => setSessions(Array.isArray(data) ? data : []));
    }
  }, [tab, sessions]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <h1 className="text-3xl font-black tracking-tight mb-4">Historique</h1>

      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab("checkins")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-11 ${
            tab === "checkins" ? "bg-orange-500 text-white" : "text-zinc-400"
          }`}
        >
          Check-ins
        </button>
        <button
          onClick={() => setTab("chats")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-11 ${
            tab === "chats" ? "bg-orange-500 text-white" : "text-zinc-400"
          }`}
        >
          Chats
        </button>
      </div>

      {tab === "checkins" && <CheckinList checkins={checkins} />}
      {tab === "chats" && <ChatsList sessions={sessions} />}
    </div>
  );
}

function CheckinList({ checkins }: { checkins: Checkin[] }) {
  if (checkins.length === 0) {
    return (
      <div className="text-center text-zinc-600 mt-10">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-base">Aucun check-in encore. Commence demain matin.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {checkins.map((checkin) => {
        const goals = (JSON.parse(checkin.goals) as string[]).filter(Boolean);
        return (
          <div key={checkin.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-zinc-300 capitalize">
                {formatDateFR(checkin.date)}
              </span>
              <span
                className={`text-2xl font-black ${
                  checkin.score >= 16
                    ? "text-green-400"
                    : checkin.score >= 10
                    ? "text-orange-400"
                    : "text-red-400"
                }`}
              >
                {checkin.score}
                <span className="text-base font-normal text-zinc-500">/20</span>
              </span>
            </div>

            {goals.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Objectifs
                </p>
                <ul className="space-y-0.5">
                  {goals.map((g, i) => (
                    <li key={i} className="text-base text-zinc-300">• {g}</li>
                  ))}
                </ul>
              </div>
            )}

            {checkin.missedText && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Ce qui a raté
                </p>
                <p className="text-base text-zinc-400">{checkin.missedText}</p>
              </div>
            )}

            {checkin.jarvisResponse && (
              <div className="bg-zinc-800 rounded-xl p-3 mt-2">
                <p className="text-xs font-bold text-orange-400 mb-1">🤖 JARVIS</p>
                <p className="text-base text-zinc-200 leading-relaxed">{checkin.jarvisResponse}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChatsList({ sessions }: { sessions: ChatSession[] | null }) {
  if (sessions === null) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-zinc-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (sessions.length === 0) {
    return (
      <div className="text-center text-zinc-600 mt-10">
        <p className="text-4xl mb-3">💬</p>
        <p className="text-base">Aucune conversation pour l&apos;instant.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <Link
          key={s.date}
          href={`/history/chat/${s.date}`}
          className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-zinc-300 capitalize">
              {formatDateFR(s.date)}
            </span>
            <span className="text-xs text-zinc-500 font-medium">{s.count} msg</span>
          </div>
          {s.preview && (
            <p className="text-sm text-zinc-500 line-clamp-2">{s.preview}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
