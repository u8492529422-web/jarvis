"use client";

import CheckinForm from "@/components/CheckinForm";
import HabitList from "@/components/HabitList";
import JarvisResponse from "@/components/JarvisResponse";
import { formatDateFR, todayStr } from "@/lib/utils";
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
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black tracking-tight mb-1">JARVIS</h1>
        <p className="text-sm text-zinc-500 capitalize mb-6">{formatDateFR(today)}</p>

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

        <HabitList date={today} />
      </div>
    </div>
  );
}
