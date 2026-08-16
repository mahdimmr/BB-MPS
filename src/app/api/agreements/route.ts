import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { isHr, isSolidLeadOf } from "@/lib/auth/rbac";
import { weightSummary } from "@/lib/domain/agreement";
import { ownerSelect } from "@/lib/domain/agreement-repo";
import { acceptsAgreements } from "@/lib/domain/cycle";
import { apiError, jsonCreated, jsonOk, readJson, readQuery, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createAgreementSchema, listAgreementsQuerySchema } from "@/lib/validation/agreement";

export const GET = route(async (request) => {
  const user = await requireUser();
  const query = readQuery(request, listAgreementsQuerySchema);

  const visibility = isHr(user)
    ? {}
    : {
        OR: [
          { userId: user.id },
          { user: { solidLeadId: user.id } },
          { user: { dottedLeadId: user.id } },
        ],
      };

  const scoped =
    query.scope === "mine"
      ? { userId: user.id }
      : query.scope === "reports"
        ? { user: { OR: [{ solidLeadId: user.id }, { dottedLeadId: user.id }] } }
        : {};

  const where = {
    AND: [
      visibility,
      scoped,
      query.cycleId ? { cycleId: query.cycleId } : {},
      query.userId ? { userId: query.userId } : {},
      query.status ? { status: query.status } : {},
    ],
  };

  const [agreements, total] = await Promise.all([
    prisma.performanceAgreement.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: query.take,
      skip: query.skip,
      include: {
        user: { select: ownerSelect },
        cycle: { select: { id: true, title: true, status: true } },
        items: { select: { layer: true, weight: true } },
      },
    }),
    prisma.performanceAgreement.count({ where }),
  ]);

  return jsonOk({
    items: agreements.map(({ items, ...agreement }) => ({
      ...agreement,
      itemCount: items.length,
      weights: weightSummary(items),
    })),
    total,
    take: query.take,
    skip: query.skip,
  });
});

export const POST = route(async (request) => {
  const actor = await requireUser();
  const input = await readJson(request, createAgreementSchema);
  const targetUserId = input.userId ?? actor.id;

  const owner = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { ...ownerSelect, status: true },
  });

  if (!owner) throw apiError.notFound();

  // An employee opens their own agreement; a solid lead or HR may open it for them.
  if (owner.id !== actor.id && !isHr(actor) && !isSolidLeadOf(actor, owner)) {
    throw apiError.forbidden();
  }

  // The whole workflow (approval, grading, PIP ownership) hangs off the solid lead.
  if (!owner.solidLeadId) throw apiError.unprocessable("AGREEMENT_NO_SOLID_LEAD");

  const cycle = await prisma.performanceCycle.findUnique({
    where: { id: input.cycleId },
    select: { id: true, status: true },
  });

  if (!cycle) throw apiError.notFound();
  if (!acceptsAgreements(cycle.status)) {
    throw apiError.conflict("CYCLE_NOT_OPEN_FOR_AGREEMENTS");
  }

  const agreement = await prisma.performanceAgreement.create({
    data: {
      userId: owner.id,
      cycleId: cycle.id,
      items: {
        create: input.items.map((item, index) => ({
          layer: item.layer,
          title: item.title,
          titleEn: item.titleEn,
          description: item.description,
          weight: item.weight,
          targetValue: item.targetValue,
          measurementMethod: item.measurementMethod,
          dueDate: item.dueDate,
          isStretch: item.isStretch,
          companyObjectiveId: item.companyObjectiveId,
          developmentCategory: item.developmentCategory,
          order: item.order || index,
        })),
      },
    },
    include: {
      user: { select: ownerSelect },
      cycle: { select: { id: true, title: true, status: true } },
      items: true,
    },
  });

  await recordAudit({
    actorId: actor.id,
    action: "agreement.create",
    entityType: "PerformanceAgreement",
    entityId: agreement.id,
    after: { userId: agreement.userId, cycleId: agreement.cycleId, items: agreement.items.length },
    request,
  });

  return jsonCreated({ ...agreement, weights: weightSummary(agreement.items) });
});
