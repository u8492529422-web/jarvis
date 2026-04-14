import { db } from "@/lib/db";
import { habitLogs } from "@/lib/schema";
import { todayStr } from "@/lib/utils";
import { HABITS } from "@/lib/habits";
import { and, eq, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/habits?date=YYYY-MM-DD → logs du jour + streaks
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || todayStr();

  const logs = await db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.date, date));

  const completedMap: Record<string, boolean> = {};
  for (const log of logs) {
    completedMap[log.habitKey] = log.completed;
  }

  // Calculer streak pour chaque habitude (30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const recentLogs = await db
    .select()
    .from(habitLogs)
    .where(and(gte(habitLogs.date, fromDate), lte(habitLogs.date, date)));

  // Grouper par habitKey
  const logsByHabit: Record<string, Record<string, boolean>> = {};
  for (const log of recentLogs) {
    if (!logsByHabit[log.habitKey]) logsByHabit[log.habitKey] = {};
    logsByHabit[log.habitKey][log.date] = log.completed;
  }

  const streaks: Record<string, number> = {};
  for (const habit of HABITS) {
    let streak = 0;
    const checkDate = new Date(date);
    // Ne pas compter la journée actuelle dans le streak (pas encore terminée)
    checkDate.setDate(checkDate.getDate() - 1);
    while (streak < 30) {
      const d = checkDate.toISOString().slice(0, 10);
      if (logsByHabit[habit.key]?.[d]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    streaks[habit.key] = streak;
  }

  return NextResponse.json({ completed: completedMap, streaks });
}

// POST /api/habits { habitKey, completed, date? }
export async function POST(req: NextRequest) {
  const { habitKey, completed, date } = await req.json();
  const logDate = date || todayStr();

  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitKey, habitKey), eq(habitLogs.date, logDate)));

  if (existing.length > 0) {
    await db
      .update(habitLogs)
      .set({ completed })
      .where(and(eq(habitLogs.habitKey, habitKey), eq(habitLogs.date, logDate)));
  } else {
    await db.insert(habitLogs).values({ habitKey, date: logDate, completed });
  }

  return NextResponse.json({ ok: true });
}
