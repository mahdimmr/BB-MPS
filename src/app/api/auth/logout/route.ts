import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { route } from "@/lib/http";

export const POST = route(async () => {
  const user = await getCurrentUser();
  const response = NextResponse.json({ data: { signedOut: true, userId: user?.id ?? null } });

  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));

  return response;
});
