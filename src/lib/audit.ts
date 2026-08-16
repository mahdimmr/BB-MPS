import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  request?: Request;
};

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/// Audit writes must never mask the original request failure, so they are logged
/// and swallowed rather than thrown.
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: toJson(input.before),
        after: toJson(input.after),
        ipAddress: input.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: input.request?.headers.get("user-agent") ?? null,
      },
    });
  } catch (error) {
    console.error("[bb-pms] failed to write audit log", { action: input.action, error });
  }
}
