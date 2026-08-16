import { recordAudit } from "@/lib/audit";
import { requireUser, type SessionUser } from "@/lib/auth/current-user";
import { isHr, isSolidLeadOf } from "@/lib/auth/rbac";
import { assertEditable } from "@/lib/domain/agreement";
import { loadAgreement, type LoadedAgreement } from "@/lib/domain/agreement-repo";
import { apiError, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { updateAgreementItemSchema } from "@/lib/validation/agreement";

type Context = { params: Promise<{ agreementId: string; itemId: string }> };

function requireGoalAuthor(user: SessionUser, agreement: LoadedAgreement): void {
  const mayEdit = isHr(user) || agreement.user.id === user.id || isSolidLeadOf(user, agreement.user);
  if (!mayEdit) throw apiError.forbidden();
}

export const PATCH = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId, itemId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireGoalAuthor(user, agreement);
  assertEditable(agreement.status);

  const existing = agreement.items.find((item) => item.id === itemId);
  if (!existing) throw apiError.notFound();

  const input = await readJson(request, updateAgreementItemSchema);

  // Layer-specific fields are cleared when an item moves to another layer.
  const layer = input.layer ?? existing.layer;
  const item = await prisma.agreementItem.update({
    where: { id: itemId },
    data: {
      ...input,
      layer,
      companyObjectiveId:
        layer === "STRATEGIC" ? (input.companyObjectiveId ?? existing.companyObjectiveId) : null,
      isStretch: layer === "STRATEGIC" ? (input.isStretch ?? existing.isStretch) : false,
      developmentCategory:
        layer === "DEVELOPMENTAL"
          ? (input.developmentCategory ?? existing.developmentCategory)
          : null,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: "agreement.item.update",
    entityType: "AgreementItem",
    entityId: itemId,
    before: existing,
    after: item,
    request,
  });

  return jsonOk(item);
});

export const DELETE = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId, itemId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireGoalAuthor(user, agreement);
  assertEditable(agreement.status);

  const existing = agreement.items.find((item) => item.id === itemId);
  if (!existing) throw apiError.notFound();

  await prisma.agreementItem.delete({ where: { id: itemId } });

  await recordAudit({
    actorId: user.id,
    action: "agreement.item.delete",
    entityType: "AgreementItem",
    entityId: itemId,
    before: existing,
    request,
  });

  return jsonOk({ id: itemId, deleted: true });
});
