"use client";

import { useState } from "react";
import Timer from "@/components/Timer";

export default function TimerButton({ minutes }: { minutes: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 text-sm font-semibold px-3 py-2 rounded-xl active:scale-95 transition-transform min-h-11"
      >
        <span className="text-base">⏱️</span>
        Démarrer timer {minutes} min
      </button>
      {open && <Timer minutes={minutes} onClose={() => setOpen(false)} />}
    </>
  );
}
