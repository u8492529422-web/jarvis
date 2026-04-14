"use client";

import { HABITS } from "@/lib/habits";
import { useEffect, useState } from "react";

type HabitState = {
  completed: Record<string, boolean>;
  streaks: Record<string, number>;
};

export default function HabitList({ date }: { date: string }) {
  const [state, setState] = useState<HabitState>({ completed: {}, streaks: {} });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/habits?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setState(data);
        setLoading(false);
      });
  }, [date]);

  const toggle = async (key: string) => {
    const newVal = !state.completed[key];
    setToggling(key);
    setState((prev) => ({
      ...prev,
      completed: { ...prev.completed, [key]: newVal },
    }));
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitKey: key, completed: newVal, date }),
    });
    setToggling(null);
  };

  const completedCount = Object.values(state.completed).filter(Boolean).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {HABITS.map((h) => (
          <div key={h.key} className="h-14 bg-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Habitudes du jour</h2>
        <span className="text-sm font-bold text-zinc-400">
          <span className={completedCount === 20 ? "text-green-400" : "text-white"}>
            {completedCount}
          </span>
          /20
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-zinc-800 rounded-full h-2 mb-5">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / 20) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {HABITS.map((habit) => {
          const done = !!state.completed[habit.key];
          const streak = state.streaks[habit.key] || 0;
          return (
            <button
              key={habit.key}
              onClick={() => toggle(habit.key)}
              disabled={toggling === habit.key}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95 ${
                done
                  ? "bg-orange-500/20 border border-orange-500/40"
                  : "bg-zinc-800 border border-zinc-700"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-orange-500 border-orange-500"
                    : "border-zinc-600"
                }`}
              >
                {done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <span className="text-lg">{habit.emoji}</span>
              <span className={`flex-1 text-left text-sm font-medium ${done ? "text-white" : "text-zinc-400"}`}>
                {habit.label}
              </span>

              {/* Streak */}
              {streak > 0 && (
                <span className="text-xs text-orange-400 font-bold">
                  🔥{streak}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
