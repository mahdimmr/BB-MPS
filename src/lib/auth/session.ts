import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

export const SESSION_COOKIE = "bbpms_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

function sign(value: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("base64url");
}

export function createSessionToken(userId: string, ttlSeconds = SESSION_TTL_SECONDS): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: userId, iat: now, exp: now + ttlSeconds };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
