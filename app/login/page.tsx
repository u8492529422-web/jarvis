"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const PIN_MAX = 8;
const PIN_MIN = 4;
const PIN_DOTS = 6; // nombre de pastilles visuelles

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/";
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (fullPin: string) => {
    if (fullPin.length < PIN_MIN) {
      setError(`Au moins ${PIN_MIN} chiffres`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      });
      if (!res.ok) {
        setError("Code incorrect");
        setPin("");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } else {
        router.replace(nextPath);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const press = (d: string) => {
    if (loading) return;
    setError(null);
    const next = (pin + d).slice(0, PIN_MAX);
    setPin(next);
    if (next.length === 6) submit(next);
  };

  const back = () => {
    setError(null);
    setPin((p) => p.slice(0, -1));
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="text-2xl font-black tracking-tight mb-1">JARVIS</h1>
        <p className="text-zinc-500 text-base">Entre ton code</p>
      </div>

      <div className="flex gap-3 mb-6">
        {Array.from({ length: PIN_DOTS }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              error ? "bg-red-500" : i < pin.length ? "bg-orange-500 scale-110" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>

      <p className="text-red-400 text-sm font-medium mb-4 h-5">{error ?? ""}</p>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {digits.map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="h-16 rounded-full bg-zinc-800 text-2xl font-light text-white active:scale-95 active:bg-zinc-700 transition-all"
          >
            {d}
          </button>
        ))}
        <button
          onClick={back}
          disabled={!pin.length}
          className="h-16 rounded-full text-xl text-zinc-400 active:text-white disabled:opacity-30 transition-all"
        >
          ⌫
        </button>
        <button
          onClick={() => press("0")}
          className="h-16 rounded-full bg-zinc-800 text-2xl font-light text-white active:scale-95 active:bg-zinc-700 transition-all"
        >
          0
        </button>
        <button
          onClick={() => submit(pin)}
          disabled={pin.length < PIN_MIN || loading}
          className="h-16 rounded-full bg-orange-500 text-base font-bold text-white active:scale-95 active:bg-orange-600 disabled:opacity-30 transition-all"
        >
          {loading ? "…" : "OK"}
        </button>
      </div>

      <p className="text-xs text-zinc-600 mt-6">
        {pin.length} / {PIN_MIN}–{PIN_MAX} chiffres
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <LoginInner />
    </Suspense>
  );
}
