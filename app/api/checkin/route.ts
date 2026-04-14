import { db } from "@/lib/db";
import { checkins, habitLogs } from "@/lib/schema";
import { todayStr, yesterday } from "@/lib/utils";
import { HABITS } from "@/lib/habits";
import { buildContext, getFullSystemPrompt } from "@/lib/jarvis";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// GET /api/checkin?date=YYYY-MM-DD → check-in du jour
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date") || todayStr();

    const result = await db.select().from(checkins).where(eq(checkins.date, date));

    if (result.length === 0) {
      const yd = yesterday();
      const yesterdayLogs = await db.select().from(habitLogs).where(eq(habitLogs.date, yd));
      const completed = yesterdayLogs.filter((l) => l.completed).length;
      const score = Math.round((completed / HABITS.length) * 20 * 10) / 10;
      return NextResponse.json({ exists: false, yesterdayScore: score });
    }

    const checkin = result[0];
    return NextResponse.json({
      exists: true,
      checkin: { ...checkin, goals: JSON.parse(checkin.goals) },
    });
  } catch (err) {
    console.error("[GET /api/checkin] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/checkin { missedText, goals: string[] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { missedText, goals } = body;
    const date = todayStr();

    console.log("[POST /api/checkin] date:", date, "goals:", goals);

    // Vérifier doublon
    const existing = await db.select().from(checkins).where(eq(checkins.date, date));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Check-in déjà soumis aujourd'hui" }, { status: 400 });
    }

    // Score d'hier
    const yd = yesterday();
    const yesterdayLogs = await db.select().from(habitLogs).where(eq(habitLogs.date, yd));
    const completed = yesterdayLogs.filter((l) => l.completed).length;
    const score = Math.round((completed / HABITS.length) * 20 * 10) / 10;
    console.log("[POST /api/checkin] score:", score);

    // Contexte mémoire
    const context = await buildContext();
    const systemPrompt = getFullSystemPrompt(context);

    const habitsSummary = HABITS.map((h) => {
      const log = yesterdayLogs.find((l) => l.habitKey === h.key);
      return `${log?.completed ? "✅" : "❌"} ${h.label}`;
    }).join("\n");

    const userMessage = `CHECK-IN MATINAL — ${date}

Score d'hier : ${score}/20
Habitudes d'hier :
${habitsSummary}

Ce qui a raté et pourquoi : ${missedText || "Rien à signaler"}

Objectifs du jour :
1. ${goals?.[0] || "-"}
2. ${goals?.[1] || "-"}
3. ${goals?.[2] || "-"}`;

    // Vérifier clé API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[POST /api/checkin] ANTHROPIC_API_KEY manquante");
      return NextResponse.json({ error: "Clé API Anthropic manquante" }, { status: 500 });
    }

    console.log("[POST /api/checkin] appel Anthropic...");
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    console.log("[POST /api/checkin] réponse Anthropic reçue");

    const jarvisResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    await db.insert(checkins).values({
      date,
      score,
      missedText: missedText || "",
      goals: JSON.stringify(goals || []),
      jarvisResponse,
    });

    console.log("[POST /api/checkin] check-in sauvegardé");
    return NextResponse.json({ score, jarvisResponse });
  } catch (err) {
    console.error("[POST /api/checkin] erreur:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
