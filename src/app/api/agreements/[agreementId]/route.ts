import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { isHr, isSolidLeadOf, requireCanViewSubject } from "@/lib/auth/rbac";
import { availableActions, METRIC_LAYERS, weightSummary } from "@/lib/domain/agreement";
import { loadAgreement } from "@/lib/domain/agreement-repo";
import { apiError, jsonOk, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ agreementId: string }> };

export const GET = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireCanViewSubject(user, agreement.user);

  const comments = await prisma.agreementComment.findMany({
    where: { agreementId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, nameEn: true, roles: true } } },
  });

  return jsonOk({
    ...agreement,
    layers: METRIC_LAYERS.map((layer) => ({
      layer,
      items: agreement.items.filter((item) => item.layer === layer),
    })),
    weights: weightSummary(agreement.items),
    comments,
    availableActions: availableActions(user, agreement.user, agreement.status),
  });
});

export const DELETE = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);

  const mayDelete =
    isHr(user) || agreement.user.id === user.id || isSolidLeadOf(user, agreement.user);

  if (!mayDelete) throw apiError.forbidden();

  // Signed or approved agreements stay on record; HR archives them instead.
  if (agreement.status !== "DRAFT") throw apiError.conflict("AGREEMENT_LOCKED");

  await prisma.performanceAgreement.delete({ where: { id: agreementId } });

  await recordAudit({
    actorId: user.id,
    action: "agreement.delete",
    entityType: "PerformanceAgreement",
    entityId: agreementId,
    before: { userId: agreement.userId, cycleId: agreement.cycleId, status: agreement.status },
    request,
  });

  return jsonOk({ id: agreementId, deleted: true });
});
