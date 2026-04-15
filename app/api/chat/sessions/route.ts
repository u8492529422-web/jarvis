import { db } from "@/lib/db";
import { chatMessages } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

type SessionSummary = {
  date: string;
  count: number;
  preview: string;
};

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt));

    const byDate = new Map<string, { count: number; firstUser?: string }>();
    for (const r of rows) {
      const entry = byDate.get(r.sessionDate) ?? { count: 0 };
      entry.count += 1;
      if (!entry.firstUser && r.role === "user") {
        entry.firstUser = r.content;
      }
      byDate.set(r.sessionDate, entry);
    }

    const sessions: SessionSummary[] = [...byDate.entries()]
      .map(([date, v]) => ({
        date,
        count: v.count,
        preview: (v.firstUser || "").slice(0, 120),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json(sessions);
  } catch (err) {
    console.error("[GET /api/chat/sessions] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
