import { db } from "@/lib/db";
import { checkins } from "@/lib/schema";
import { formatDateFR } from "@/lib/utils";
import Link from "next/link";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const allCheckins = await db
    .select()
    .from(checkins)
    .orderBy(desc(checkins.date));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-black tracking-tight">Historique</h1>
          <p className="text-xs text-zinc-500">{allCheckins.length} check-ins</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {allCheckins.length === 0 && (
          <div className="text-center text-zinc-600 mt-10">
            <p className="text-3xl mb-3">📋</p>
            <p>Aucun check-in encore. Commence demain matin.</p>
          </div>
        )}

        {allCheckins.map((checkin) => {
          const goals = JSON.parse(checkin.goals) as string[];
          return (
            <div
              key={checkin.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            >
              {/* Date + Score */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-zinc-300 capitalize">
                  {formatDateFR(checkin.date)}
                </span>
                <span
                  className={`text-xl font-black ${
                    checkin.score >= 16
                      ? "text-green-400"
                      : checkin.score >= 10
                      ? "text-orange-400"
                      : "text-red-400"
                  }`}
                >
                  {checkin.score}
                  <span className="text-sm font-normal text-zinc-500">/20</span>
                </span>
              </div>

              {/* Objectifs */}
              {goals.filter(Boolean).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Objectifs
                  </p>
                  <ul className="space-y-0.5">
                    {goals.filter(Boolean).map((g, i) => (
                      <li key={i} className="text-sm text-zinc-300">
                        • {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raté */}
              {checkin.missedText && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Ce qui a raté
                  </p>
                  <p className="text-sm text-zinc-400">{checkin.missedText}</p>
                </div>
              )}

              {/* Réponse Jarvis */}
              {checkin.jarvisResponse && (
                <div className="bg-zinc-800 rounded-xl p-3 mt-2">
                  <p className="text-xs font-bold text-orange-400 mb-1">🤖 JARVIS</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {checkin.jarvisResponse}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
