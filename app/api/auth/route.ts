import { NextRequest, NextResponse } from "next/server";
import { signAuthToken, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const expected = process.env.ACCESS_PIN?.trim();

    if (!expected) {
      console.error("[auth] ACCESS_PIN non configuré");
      return NextResponse.json({ error: "ACCESS_PIN non configuré côté serveur" }, { status: 500 });
    }
    const submitted = typeof pin === "string" ? pin.trim() : "";
    console.log(`[auth] tentative: len=${submitted.length}, expected len=${expected.length}`);
    if (submitted !== expected) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
    }

    const token = await signAuthToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
