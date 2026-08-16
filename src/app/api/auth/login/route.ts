import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAudit } from "@/lib/audit";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { ApiError, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});

/// Verified against a throwaway hash when the account does not exist, so the
/// response time does not reveal whether an email is registered.
const DUMMY_HASH =
  "scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export const POST = route(async (request) => {
  const { email, password } = await readJson(request, loginSchema);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, roles: true, status: true, locale: true, passwordHash: true },
  });

  const passwordValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordValid) {
    throw new ApiError(401, "INVALID_CREDENTIALS");
  }

  if (user.status === "TERMINATED" || user.status === "INACTIVE") {
    throw new ApiError(403, "ACCOUNT_INACTIVE");
  }

  const response = NextResponse.json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      locale: user.locale,
    },
  });

  response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());

  await recordAudit({
    actorId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
    request,
  });

  return response;
});
