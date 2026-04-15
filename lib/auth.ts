import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "jarvis_auth";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET manquant ou trop court (min 16 chars)");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(): Promise<string> {
  return await new SignJWT({ ok: true })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyAuthToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    return true;
  } catch {
    return false;
  }
}
