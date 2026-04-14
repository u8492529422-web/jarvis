"use client";

import { useState } from "react";

type Props = {
  yesterdayScore: number;
  onComplete: (response: string, score: number) => void;
};

export default function CheckinForm({ yesterdayScore, onComplete }: Props) {
  const [missedText, setMissedText] = useState("");
  const [goals, setGoals] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);

  const setGoal = (i: number, val: string) => {
    const next = [...goals];
    next[i] = val;
    setGoals(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missedText, goals }),
      });
      const data = await res.json();
      if (data.jarvisResponse) {
        onComplete(data.jarvisResponse, data.score);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚡</span>
        <h2 className="text-lg font-bold text-white">Check-in matinal</h2>
      </div>

      {/* Score d'hier */}
      <div className="bg-zinc-800 rounded-xl p-3 mb-4 flex items-center justify-between">
        <span className="text-zinc-400 text-sm">Score d'hier</span>
        <span className={`text-2xl font-black ${
          yesterdayScore >= 16 ? "text-green-400" :
          yesterdayScore >= 10 ? "text-orange-400" : "text-red-400"
        }`}>
          {yesterdayScore}<span className="text-base font-normal text-zinc-500">/20</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ce qui a raté */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Ce qui a raté hier & pourquoi
          </label>
          <textarea
            value={missedText}
            onChange={(e) => setMissedText(e.target.value)}
            placeholder="Sois honnête. Jarvis n'accepte pas les excuses."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* 3 objectifs */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            3 objectifs du jour
          </label>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                value={goals[i]}
                onChange={(e) => setGoal(i, e.target.value)}
                placeholder={`Objectif ${i + 1}...`}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
        >
          {loading ? "Jarvis analyse..." : "Soumettre le check-in →"}
        </button>
      </form>
    </div>
  );
}
