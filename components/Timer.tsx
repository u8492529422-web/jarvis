"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  minutes: number;
  onClose: () => void;
};

function format(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Timer({ minutes, onClose }: Props) {
  const total = minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || done) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setDone(true);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, done]);

  const progress = ((total - remaining) / total) * 100;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 w-[min(90vw,22rem)]"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
          {done ? "Terminé" : running ? "Focus en cours" : "En pause"}
        </span>
        <button
          onClick={onClose}
          className="text-zinc-500 active:text-white text-lg leading-none"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      <div className={`text-5xl font-black tracking-tight tabular-nums mb-3 ${done ? "text-green-400" : "text-white"}`}>
        {format(remaining)}
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className="bg-orange-500 h-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2">
        {!done && (
          <button
            onClick={() => setRunning((v) => !v)}
            className="flex-1 bg-orange-500 text-white font-semibold py-2.5 rounded-xl active:scale-95 transition-transform min-h-11"
          >
            {running ? "Pause" : "Reprendre"}
          </button>
        )}
        <button
          onClick={() => {
            setRemaining(total);
            setDone(false);
            setRunning(true);
          }}
          className="flex-1 bg-zinc-800 text-zinc-300 font-semibold py-2.5 rounded-xl active:scale-95 transition-transform min-h-11"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
