import { db } from "@/lib/db";
import { chatMessages } from "@/lib/schema";
import { todayStr } from "@/lib/utils";
import { buildContext, getFullSystemPrompt } from "@/lib/jarvis";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// POST /api/chat { message } → streaming SSE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;
    const sessionDate = todayStr();

    console.log("[POST /api/chat] message reçu:", message?.slice(0, 50));

    // Vérifier clé API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[POST /api/chat] ANTHROPIC_API_KEY manquante");
      return NextResponse.json({ error: "Clé API Anthropic manquante" }, { status: 500 });
    }

    // Sauvegarder le message user
    await db.insert(chatMessages).values({ sessionDate, role: "user", content: message });

    // Récupérer l'historique complet de la session
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionDate, sessionDate));

    const messages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Contexte mémoire
    const context = await buildContext();
    const systemPrompt = getFullSystemPrompt(context);

    console.log("[POST /api/chat] démarrage stream Anthropic, nb messages:", messages.length);

    const anthropic = new Anthropic({ apiKey });
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 600,
            system: systemPrompt,
            messages,
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              fullResponse += chunk.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
              );
            }
          }

          // Sauvegarder la réponse complète en BDD
          if (fullResponse) {
            await db.insert(chatMessages).values({
              sessionDate,
              role: "assistant",
              content: fullResponse,
            });
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          console.log("[POST /api/chat] stream terminé, réponse sauvegardée");
        } catch (err) {
          console.error("[POST /api/chat] erreur dans le stream:", err);
          const message = err instanceof Error ? err.message : String(err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[POST /api/chat] erreur avant stream:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/chat?date=YYYY-MM-DD → historique de la session
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date") || todayStr();
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionDate, date));
    return NextResponse.json(history);
  } catch (err) {
    console.error("[GET /api/chat] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
