"use client";

import CheckinForm from "@/components/CheckinForm";
import HabitList from "@/components/HabitList";
import JarvisResponse from "@/components/JarvisResponse";
import { formatDateFR, todayStr } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

type CheckinData = {
  exists: boolean;
  yesterdayScore?: number;
  checkin?: {
    score: number;
    jarvisResponse: string;
    goals: string[];
    missedText: string;
  };
};

export default function TodayPage() {
  const today = todayStr();
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [jarvisResponse, setJarvisResponse] = useState<{ text: string; score: number } | null>(null);

  useEffect(() => {
    fetch(`/api/checkin?date=${today}`)
      .then((r) => r.json())
      .then((data: CheckinData) => {
        setCheckinData(data);
        if (data.exists && data.checkin) {
          setJarvisResponse({
            text: data.checkin.jarvisResponse,
            score: data.checkin.score,
          });
        }
      });
  }, [today]);

  const handleCheckinComplete = (response: string, score: number) => {
    setJarvisResponse({ text: response, score });
    setCheckinData((prev) => (prev ? { ...prev, exists: true } : prev));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight">JARVIS</h1>
          <p className="text-xs text-zinc-500">{formatDateFR(today)}</p>
        </div>
        <nav className="flex gap-3">
          <Link href="/chat" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            Chat
          </Link>
          <Link href="/history" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            Historique
          </Link>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Check-in ou réponse Jarvis */}
        {checkinData === null ? (
          <div className="h-32 bg-zinc-800 rounded-2xl animate-pulse mb-6" />
        ) : !checkinData.exists && !jarvisResponse ? (
          <CheckinForm
            yesterdayScore={checkinData.yesterdayScore ?? 0}
            onComplete={handleCheckinComplete}
          />
        ) : jarvisResponse ? (
          <JarvisResponse response={jarvisResponse.text} score={jarvisResponse.score} />
        ) : null}

        {/* Habitudes */}
        <HabitList date={today} />
      </div>
    </div>
  );
}
