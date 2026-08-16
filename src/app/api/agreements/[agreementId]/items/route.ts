import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { isHr, isSolidLeadOf, requireCanViewSubject } from "@/lib/auth/rbac";
import { assertEditable, weightSummary } from "@/lib/domain/agreement";
import { itemOrder, loadAgreement, type LoadedAgreement } from "@/lib/domain/agreement-repo";
import { apiError, jsonCreated, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth/current-user";
import { agreementItemSchema, replaceItemsSchema } from "@/lib/validation/agreement";

type Context = { params: Promise<{ agreementId: string }> };

/// Goals are authored by the employee and their solid lead. The dotted lead
/// contributes through comments instead of editing directly.
function requireGoalAuthor(user: SessionUser, agreement: LoadedAgreement): void {
  const mayEdit = isHr(user) || agreement.user.id === user.id || isSolidLeadOf(user, agreement.user);
  if (!mayEdit) throw apiError.forbidden();
}

export const GET = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireCanViewSubject(user, agreement.user);

  return jsonOk({ items: agreement.items, weights: weightSummary(agreement.items) });
});

export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireGoalAuthor(user, agreement);
  assertEditable(agreement.status);

  const input = await readJson(request, agreementItemSchema);

  const item = await prisma.agreementItem.create({
    data: {
      agreementId,
      layer: input.layer,
      title: input.title,
      titleEn: input.titleEn,
      description: input.description,
      weight: input.weight,
      targetValue: input.targetValue,
      measurementMethod: input.measurementMethod,
      dueDate: input.dueDate,
      isStretch: input.isStretch,
      companyObjectiveId: input.companyObjectiveId,
      developmentCategory: input.developmentCategory,
      order: input.order || agreement.items.length,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: "agreement.item.create",
    entityType: "AgreementItem",
    entityId: item.id,
    after: item,
    request,
  });

  return jsonCreated(item);
});

/// Bulk save for the collaborative goal-setting screen: replaces the whole set in
/// one transaction so partial saves can never leave the weights inconsistent.
export const PUT = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireGoalAuthor(user, agreement);
  assertEditable(agreement.status);

  const { items } = await readJson(request, replaceItemsSchema);

  const saved = await prisma.$transaction(async (tx) => {
    await tx.agreementItem.deleteMany({ where: { agreementId } });

    await tx.agreementItem.createMany({
      data: items.map((item, index) => ({
        agreementId,
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
    });

    return tx.agreementItem.findMany({ where: { agreementId }, orderBy: itemOrder });
  });

  await recordAudit({
    actorId: user.id,
    action: "agreement.items.replace",
    entityType: "PerformanceAgreement",
    entityId: agreementId,
    before: { items: agreement.items },
    after: { items: saved },
    request,
  });

  return jsonOk({ items: saved, weights: weightSummary(saved) });
});
