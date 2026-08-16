import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { requireHr } from "@/lib/auth/rbac";
import { assertCycleDuration, defaultMilestones, derivePhase } from "@/lib/domain/cycle";
import { apiError, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { updateCycleSchema } from "@/lib/validation/cycle";

type Context = { params: Promise<{ cycleId: string }> };

export const GET = route<Context>(async (_request, { params }) => {
  await requireUser();
  const { cycleId } = await params;

  const cycle = await prisma.performanceCycle.findUnique({
    where: { id: cycleId },
    include: {
      companyObjectives: { orderBy: { order: "asc" } },
      createdBy: { select: { id: true, name: true, nameEn: true } },
      _count: { select: { agreements: true, finalEvaluations: true, calibrationSessions: true } },
    },
  });

  if (!cycle) throw apiError.notFound();

  return jsonOk({ ...cycle, phase: derivePhase(cycle) });
});

export const PATCH = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  requireHr(user);

  const { cycleId } = await params;
  const input = await readJson(request, updateCycleSchema);

  const existing = await prisma.performanceCycle.findUnique({ where: { id: cycleId } });
  if (!existing) throw apiError.notFound();

  const reschedules = input.startDate !== undefined || input.endDate !== undefined;

  // Once a cycle is running, its dates are fixed — everyone's goals hang off them.
  if (reschedules && existing.status !== "DRAFT") {
    throw apiError.conflict("INVALID_TRANSITION");
  }

  const startDate = input.startDate ?? existing.startDate;
  const endDate = input.endDate ?? existing.endDate;

  if (reschedules) {
    assertCycleDuration(startDate, endDate);
  }

  const milestones = reschedules ? defaultMilestones(startDate, endDate) : null;

  const cycle = await prisma.performanceCycle.update({
    where: { id: cycleId },
    data: {
      title: input.title,
      titleEn: input.titleEn,
      description: input.description,
      startDate,
      endDate,
      goalSettingDeadline: input.goalSettingDeadline ?? milestones?.goalSettingDeadline,
      midTermReviewDate: input.midTermReviewDate ?? milestones?.midTermReviewDate,
      finalEvaluationStart: input.finalEvaluationStart ?? milestones?.finalEvaluationStart,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: "cycle.update",
    entityType: "PerformanceCycle",
    entityId: cycle.id,
    before: existing,
    after: cycle,
    request,
  });

  return jsonOk({ ...cycle, phase: derivePhase(cycle) });
});

export const DELETE = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  requireHr(user);

  const { cycleId } = await params;

  const cycle = await prisma.performanceCycle.findUnique({
    where: { id: cycleId },
    include: { _count: { select: { agreements: true, finalEvaluations: true } } },
  });

  if (!cycle) throw apiError.notFound();

  // Anything with performance history attached is archived, never deleted.
  if (cycle.status !== "DRAFT" || cycle._count.agreements > 0 || cycle._count.finalEvaluations > 0) {
    throw apiError.conflict("INVALID_TRANSITION");
  }

  await prisma.performanceCycle.delete({ where: { id: cycleId } });

  await recordAudit({
    actorId: user.id,
    action: "cycle.delete",
    entityType: "PerformanceCycle",
    entityId: cycleId,
    before: cycle,
    request,
  });

  return jsonOk({ id: cycleId, deleted: true });
});
