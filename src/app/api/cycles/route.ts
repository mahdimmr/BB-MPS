import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { requireHr } from "@/lib/auth/rbac";
import {
  assertCycleDuration,
  defaultMilestones,
  derivePhase,
  expectedCycleEnd,
} from "@/lib/domain/cycle";
import { apiError, jsonCreated, jsonOk, readJson, readQuery, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createCycleSchema, listCyclesQuerySchema } from "@/lib/validation/cycle";

export const GET = route(async (request) => {
  await requireUser();
  const { status, take, skip } = readQuery(request, listCyclesQuerySchema);

  const [cycles, total] = await Promise.all([
    prisma.performanceCycle.findMany({
      where: status ? { status } : undefined,
      orderBy: { startDate: "desc" },
      take,
      skip,
      include: {
        _count: { select: { agreements: true, companyObjectives: true, finalEvaluations: true } },
      },
    }),
    prisma.performanceCycle.count({ where: status ? { status } : undefined }),
  ]);

  return jsonOk({
    items: cycles.map((cycle) => ({ ...cycle, phase: derivePhase(cycle) })),
    total,
    take,
    skip,
  });
});

export const POST = route(async (request) => {
  const user = await requireUser();
  requireHr(user);

  const input = await readJson(request, createCycleSchema);
  const startDate = input.startDate;
  const endDate = input.endDate ?? expectedCycleEnd(startDate);

  assertCycleDuration(startDate, endDate);

  const milestones = defaultMilestones(startDate, endDate);

  // A person can only be measured against one cycle at a time.
  const overlapping = await prisma.performanceCycle.findFirst({
    where: {
      status: { in: ["DRAFT", "ACTIVE", "CALIBRATING"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    select: { id: true, title: true },
  });

  if (overlapping) {
    throw apiError.conflict("CYCLE_OVERLAP");
  }

  const cycle = await prisma.performanceCycle.create({
    data: {
      title: input.title,
      titleEn: input.titleEn,
      description: input.description,
      startDate,
      endDate,
      goalSettingDeadline: input.goalSettingDeadline ?? milestones.goalSettingDeadline,
      midTermReviewDate: input.midTermReviewDate ?? milestones.midTermReviewDate,
      finalEvaluationStart: input.finalEvaluationStart ?? milestones.finalEvaluationStart,
      createdById: user.id,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: "cycle.create",
    entityType: "PerformanceCycle",
    entityId: cycle.id,
    after: cycle,
    request,
  });

  return jsonCreated({ ...cycle, phase: derivePhase(cycle) });
});
