import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { requireHr } from "@/lib/auth/rbac";
import { assertCycleTransition, derivePhase } from "@/lib/domain/cycle";
import { apiError, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cycleTransitionSchema } from "@/lib/validation/cycle";

type Context = { params: Promise<{ cycleId: string }> };

export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  requireHr(user);

  const { cycleId } = await params;
  const { status } = await readJson(request, cycleTransitionSchema);

  const existing = await prisma.performanceCycle.findUnique({ where: { id: cycleId } });
  if (!existing) throw apiError.notFound();

  assertCycleTransition(existing.status, status);

  const cycle = await prisma.performanceCycle.update({
    where: { id: cycleId },
    data: { status },
  });

  await recordAudit({
    actorId: user.id,
    action: `cycle.status.${status.toLowerCase()}`,
    entityType: "PerformanceCycle",
    entityId: cycle.id,
    before: { status: existing.status },
    after: { status: cycle.status },
    request,
  });

  return jsonOk({ ...cycle, phase: derivePhase(cycle) });
});
