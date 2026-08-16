import { cookies } from "next/headers";

import type { Locale, Role, UserStatus } from "@/generated/prisma/enums";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { apiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  status: UserStatus;
  locale: Locale;
  solidLeadId: string | null;
  dottedLeadId: string | null;
};

const sessionUserSelect = {
  id: true,
  email: true,
  name: true,
  roles: true,
  status: true,
  locale: true,
  solidLeadId: true,
  dottedLeadId: true,
} as const;

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: sessionUserSelect,
  });

  if (!user || user.status === "TERMINATED" || user.status === "INACTIVE") return null;

  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw apiError.unauthenticated();

  return user;
}
