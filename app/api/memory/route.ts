import { db } from "@/lib/db";
import { memory, checkins, habitLogs } from "@/lib/schema";
import { nDaysAgo, formatDateFR } from "@/lib/utils";
import { HABITS } from "@/lib/habits";
import { buildContext, getFullSystemPrompt } from "@/lib/jarvis";
import { eq, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// GET /api/memory → lire les mémoires
export async function GET() {
  try {
    const mems = await db.select().from(memory);
    const result: Record<string, string> = {};
    for (const m of mems) {
      result[m.type] = m.content;
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/memory] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/memory { type: 'medium' | 'long' } → générer et sauvegarder
export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Anthropic manquante" }, { status: 500 });
    }
    const anthropic = new Anthropic({ apiKey });

    const context = await buildContext();
    const systemPrompt = getFullSystemPrompt(context);

    let prompt = "";

    if (type === "medium") {
      const from = nDaysAgo(7);
      const recentCheckins = await db.select().from(checkins).where(gte(checkins.date, from));

      if (recentCheckins.length === 0) {
        return NextResponse.json({ content: "Pas encore assez de données." });
      }

      const summary = recentCheckins
        .map((c) => {
          const goals = JSON.parse(c.goals) as string[];
          return `${formatDateFR(c.date)} — Score: ${c.score}/20\nObjectifs: ${goals.filter(Boolean).join(", ")}\nRaté: ${c.missedText || "rien"}`;
        })
        .join("\n\n");

      prompt = `Voici les check-ins des 7 derniers jours de Romain :\n\n${summary}\n\nFais un bilan synthétique en 5-8 lignes : tendances, points forts, points faibles récurrents, axes d'amélioration prioritaires. Sois direct et concis.`;
    } else if (type === "long") {
      const from = nDaysAgo(30);
      const recentCheckins = await db.select().from(checkins).where(gte(checkins.date, from));
      const recentHabitLogs = await db.select().from(habitLogs).where(gte(habitLogs.date, from));

      const habitStats: Record<string, { total: number; completed: number }> = {};
      for (const habit of HABITS) {
        habitStats[habit.key] = { total: 0, completed: 0 };
      }
      for (const log of recentHabitLogs) {
        if (habitStats[log.habitKey]) {
          habitStats[log.habitKey].total++;
          if (log.completed) habitStats[log.habitKey].completed++;
        }
      }

      const habitSummary = HABITS.map((h) => {
        const stats = habitStats[h.key];
        const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        return `${h.label}: ${pct}% (${stats.completed}/${stats.total} jours)`;
      }).join("\n");

      const avgScore =
        recentCheckins.length > 0
          ? Math.round((recentCheckins.reduce((s, c) => s + c.score, 0) / recentCheckins.length) * 10) / 10
          : 0;

      prompt = `Voici le bilan des 30 derniers jours de Romain.\n\nScore moyen : ${avgScore}/20\n\nTaux de complétion par habitude :\n${habitSummary}\n\nMets à jour le profil de Romain en 8-12 lignes : forces réelles, faiblesses chroniques, patterns comportementaux, objectifs implicites, points d'attention pour le coaching. Sois factuel et direct.`;
    } else {
      return NextResponse.json({ error: "type invalide" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";

    const existing = await db.select().from(memory).where(eq(memory.type, type));
    if (existing.length > 0) {
      await db
        .update(memory)
        .set({ content, updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(memory.type, type));
    } else {
      await db.insert(memory).values({ type, content });
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[POST /api/memory] erreur:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
